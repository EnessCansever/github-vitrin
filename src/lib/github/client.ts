import "server-only";
import {z} from "zod";
import {GitHubError} from "./errors";
import {normalizeProfile} from "./input";
import {
  graphSchema, pinnedSchema, profileRepoSchema, profileSchema, readmeSchema, repoName, repoSchema,
  type Profile, type Repository,
} from "./schemas";
import {GitHubTransport} from "./transport";

export type Pinned =
  | {status: "available"; repos: {id: number; name: string}[]}
  | {status: "unknown"; error: GitHubError};
export type Readme =
  | {status: "found"; text: string; path: string; sha: string; branch: string}
  | {status: "missing"}
  | {status: "unknown"; error: GitHubError};

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new GitHubError("invalid_response");
  return result.data;
}

function eligible(repo: Repository, profile: Profile): boolean {
  return !repo.isPrivate && !repo.isArchived && !repo.isFork &&
    repo.owner.type === "User" && repo.owner.id === profile.id &&
    repo.owner.login.toLowerCase() === profile.login.toLowerCase();
}

function decodeReadme(data: unknown, branch: string): Readme {
  const readme = parse(readmeSchema, data);
  if (readme.size > 256 * 1024) throw new GitHubError("too_large");
  const content = readme.content.replace(/\n/g, "");
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(content)) {
    throw new GitHubError("invalid_response");
  }
  const bytes = Buffer.from(content, "base64");
  if (bytes.length !== readme.size) throw new GitHubError("invalid_response");
  if (bytes.length > 256 * 1024) throw new GitHubError("too_large");
  let text: string;
  try {
    text = new TextDecoder("utf-8", {fatal: true}).decode(bytes);
  } catch {
    throw new GitHubError("invalid_response");
  }
  return {status: "found", text, path: readme.path, sha: readme.sha, branch};
}

const selectionSchema = z.array(z.object({
  id: z.number().int().positive().safe(), name: repoName,
})).min(1).max(3).refine(repos => new Set(repos.map(repo => repo.id)).size === repos.length);

export class GitHubClient {
  private readonly transport = new GitHubTransport();

  private async graph(query: string, login: string, expression?: string) {
    const result = parse(graphSchema, await this.transport.request("/graphql", {
      query, variables: {login, ...(expression === undefined ? {} : {expression})},
    }));
    if (result.errors?.length) {
      const codes = result.errors.map(error => error.type ?? error.extensions?.code);
      if (codes.includes("RATE_LIMITED") || result.errors.some(error => /rate limit|secondary|abuse/i.test(error.message ?? ""))) {
        const secondary = result.errors.some(error => /secondary|abuse/i.test(error.message ?? ""));
        throw this.transport.recordRateLimit("graphql", secondary ? "secondary"
          : codes.includes("RATE_LIMITED") ? "primary" : "unknown");
      }
      if (codes.some(code => code === "FORBIDDEN" || code === "UNAUTHORIZED")) throw new GitHubError("auth");
      if (codes.every(code => code === "NOT_FOUND") && result.data?.user === null) {
        throw new GitHubError("user_not_found");
      }
      throw new GitHubError(result.data?.user ? "partial" : "graphql");
    }
    if (result.data?.user === null) throw new GitHubError("user_not_found");
    if (!result.data?.user) throw new GitHubError("invalid_response");
    return result.data.user;
  }

  async getProfile(input: unknown): Promise<Profile> {
    let login: string;
    try {
      login = normalizeProfile(input);
    } catch {
      throw new GitHubError("invalid_input");
    }
    return parse(profileSchema, await this.graph(`query($login: String!) {
      user(login: $login) { databaseId login name bio websiteUrl avatarUrl }
    }`, login));
  }

  async getPinned(profile: Profile): Promise<Pinned> {
    try {
      const user = parse(z.object({pinnedItems: pinnedSchema}), await this.graph(`query($login: String!) {
        user(login: $login) {
          pinnedItems(first: 6, types: [REPOSITORY]) { nodes { ... on Repository {
            databaseId name isPrivate isArchived isFork owner { login __typename }
          } } }
        }
      }`, profile.login));
      return {status: "available", repos: user.pinnedItems.nodes
        .filter(repo => !repo.isPrivate && !repo.isArchived && !repo.isFork &&
          repo.owner.__typename === "User" &&
          repo.owner.login.toLowerCase() === profile.login.toLowerCase())
        .map(repo => ({id: repo.databaseId, name: repo.name}))};
    } catch (error) {
      if (!(error instanceof GitHubError)) throw error;
      return {status: "unknown", error};
    }
  }

  async getCandidates(profile: Profile, pinned: Pinned) {
    if (pinned.status === "unknown" &&
      ["configuration", "auth", "request_budget"].includes(pinned.error.code)) {
      throw pinned.error;
    }
    const repos: Repository[] = [];
    const seen = new Set<number>();
    if (pinned.status === "available") {
      for (const pin of pinned.repos) {
        const repo = await this.getRepository(profile, pin.name, pin.id);
        repos.push(repo);
        seen.add(repo.id);
      }
    }
    for (let page = 1; ; page++) {
      const data = await this.transport.request(
        `/users/${encodeURIComponent(profile.login)}/repos?type=owner&sort=updated&direction=desc&per_page=100&page=${page}`,
      );
      if (data === null) throw new GitHubError("user_not_found");
      const batch = parse(z.array(repoSchema).max(100), data);
      for (const repo of batch) {
        if (eligible(repo, profile) && !seen.has(repo.id)) {
          repos.push(repo);
          seen.add(repo.id);
          if (repos.length === 100) return {repos, limited: true, pinnedStatus: pinned.status};
        }
      }
      if (batch.length < 100) {
        if (!repos.length) throw new GitHubError("no_repos");
        return {repos, limited: false, pinnedStatus: pinned.status};
      }
    }
  }

  private async getRepository(profile: Profile, name: string, expectedId?: number): Promise<Repository> {
    const safeName = repoName.safeParse(name);
    if (!safeName.success) throw new GitHubError("invalid_input");
    const data = await this.transport.request(`/repos/${encodeURIComponent(profile.login)}/${encodeURIComponent(safeName.data)}`);
    if (data === null) throw new GitHubError("repo_unavailable");
    const repo = parse(repoSchema, data);
    if (!eligible(repo, profile) || (expectedId !== undefined && repo.id !== expectedId)) {
      throw new GitHubError("repo_unavailable");
    }
    return repo;
  }

  async getReadme(profile: Profile, selected: Pick<Repository, "id" | "name">): Promise<Readme> {
    try {
      const repo = await this.getRepository(profile, selected.name, selected.id);
      const path = `/repos/${encodeURIComponent(profile.login)}/${encodeURIComponent(repo.name)}`;
      const data = await this.transport.request(`${path}/readme?ref=${encodeURIComponent(repo.defaultBranch)}`);
      if (data === null) {
        const current = await this.getRepository(profile, repo.name, repo.id);
        if (current.defaultBranch !== repo.defaultBranch) throw new GitHubError("repo_unavailable");
        return {status: "missing"};
      }
      return decodeReadme(data, repo.defaultBranch);
    } catch (error) {
      if (!(error instanceof GitHubError)) throw error;
      return {status: "unknown", error};
    }
  }

  async getProfileReadme(profile: Profile): Promise<Readme> {
    try {
      const user = parse(z.object({
        databaseId: z.number(), login: z.string(), repository: profileRepoSchema.nullable(),
      }), await this.graph(`query($login: String!) {
        user(login: $login) {
          databaseId login repository(name: $login) {
            databaseId name isPrivate isEmpty owner { login __typename }
            defaultBranchRef { name target { oid } }
          }
        }
      }`, profile.login));
      if (user.databaseId !== profile.id || user.login.toLowerCase() !== profile.login.toLowerCase()) {
        throw new GitHubError("repo_unavailable");
      }
      const repo = user.repository;
      if (repo === null) return {status: "missing"};
      if (repo.name.toLowerCase() !== profile.login.toLowerCase() ||
        repo.owner.login.toLowerCase() !== profile.login.toLowerCase()) {
        throw new GitHubError("repo_unavailable");
      }
      if (repo.isPrivate || repo.isEmpty) return {status: "missing"};
      if (!repo.defaultBranchRef) throw new GitHubError("invalid_response");
      const branch = repo.defaultBranchRef;
      const root = parse(z.object({databaseId: z.number(), repository: z.object({
        databaseId: z.number(), isPrivate: z.boolean(),
        object: z.object({__typename: z.literal("Blob"), oid: z.string()}).nullable(),
      }).nullable()}), await this.graph(`query($login: String!, $expression: String!) {
        user(login: $login) { databaseId repository(name: $login) {
          databaseId isPrivate object(expression: $expression) { __typename oid }
        } }
      }`, profile.login, `${branch.target.oid}:README.md`));
      if (root.databaseId !== profile.id || !root.repository || root.repository.isPrivate ||
        root.repository.databaseId !== repo.databaseId) {
        throw new GitHubError("repo_unavailable");
      }
      if (root.repository.object === null) return {status: "missing"};
      const data = await this.transport.request(
        `/repos/${encodeURIComponent(profile.login)}/${encodeURIComponent(repo.name)}/contents/README.md?ref=${branch.target.oid}`,
      );
      if (data === null) throw new GitHubError("repo_unavailable");
      const readme = decodeReadme(data, branch.name);
      if (readme.status === "found" && (readme.path !== "README.md" || readme.sha !== root.repository.object.oid)) {
        throw new GitHubError("invalid_response");
      }
      return readme;
    } catch (error) {
      if (!(error instanceof GitHubError)) throw error;
      return {status: "unknown", error};
    }
  }

  async getSelected(profile: Profile, input: unknown) {
    const selection = selectionSchema.safeParse(input);
    if (!selection.success) throw new GitHubError("invalid_input");
    const repos = [];
    for (const selected of selection.data) {
      const repo = await this.getRepository(profile, selected.name, selected.id);
      repos.push({repo, readme: await this.getReadme(profile, repo)});
    }
    return repos;
  }
}
