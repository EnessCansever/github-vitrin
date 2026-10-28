import "server-only";
import {GitHubError, type RateLimit, type RateResource} from "./errors";

const BODY_LIMIT = 1024 * 1024;

export class GitHubTransport {
  private readonly deadline = Date.now() + 20_000;
  private requests = 0;
  private readonly limits: Record<RateResource, RateLimit> = {core: {}, graphql: {}};
  private readonly reports: Record<RateResource, RateLimit> = {core: {}, graphql: {}};
  private readonly blocked: Partial<Record<RateResource, boolean>> = {};
  private shared?: {error: GitHubError; retryAt?: number};

  recordRateLimit(
    resource: RateResource | undefined,
    scope: "primary" | "secondary" | "unknown",
    report = resource ? this.reports[resource] : {},
  ): GitHubError {
    if (scope === "primary" && report.retryAfterSeconds !== undefined) scope = "secondary";
    const limit: RateLimit = {...(resource ? this.limits[resource] : report), resource, scope};
    const error = new GitHubError("rate_limit", limit);
    if (scope === "primary" && resource) {
      this.blocked[resource] = true;
    } else {
      const retryAt = report.retryAfterSeconds !== undefined
        ? Date.now() + report.retryAfterSeconds * 1000
        : limit.remaining === 0 && limit.resetAt !== undefined && limit.resetAt * 1000 > Date.now()
          ? limit.resetAt * 1000 : undefined;
      this.shared = {error, retryAt};
    }
    return error;
  }

  async request(path: string, body?: object): Promise<unknown> {
    const resource = path === "/graphql" ? "graphql" : "core";
    const now = Date.now();
    if (this.shared) {
      if (this.shared.retryAt === undefined || this.shared.retryAt > now) throw this.shared.error;
      this.shared = undefined;
    }
    const limit = this.limits[resource];
    if (limit.resetAt !== undefined && limit.resetAt * 1000 <= now) {
      this.limits[resource] = {};
      delete this.blocked[resource];
    } else if (this.blocked[resource] || limit.remaining === 0) {
      throw new GitHubError("rate_limit", {...limit, resource, scope: "primary"});
    }
    const token = process.env.GITHUB_TOKEN?.trim();
    if (!token || !/^[a-z\d_]+$/i.test(token)) throw new GitHubError("configuration");
    if (this.requests >= 40) throw new GitHubError("request_budget");
    const remaining = this.deadline - now;
    if (remaining <= 0) throw new GitHubError("timeout");
    this.requests++;
    const signal = AbortSignal.timeout(Math.min(8_000, remaining));
    try {
      const response = await fetch(`https://api.github.com${path}`, {
        method: body ? "POST" : "GET",
        headers: {
          Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2026-03-10", "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal, cache: "no-store", redirect: "error",
      });
      const headerResource = response.headers.get("x-ratelimit-resource");
      const source = headerResource === null ? resource
        : headerResource === "core" || headerResource === "graphql" ? headerResource : undefined;
      const reported: RateLimit = {};
      for (const [header, key] of [
        ["x-ratelimit-remaining", "remaining"], ["x-ratelimit-reset", "resetAt"],
        ["retry-after", "retryAfterSeconds"],
      ] as const) {
        const value = response.headers.get(header);
        if (value !== null && /^\d+$/.test(value) && Number.isSafeInteger(Number(value))) {
          reported[key] = Number(value);
        }
      }
      if (source) {
        this.limits[source] = {...this.limits[source], ...reported};
        this.reports[source] = reported;
      }
      if (response.status === 401) {
        await response.body?.cancel();
        throw new GitHubError("configuration");
      }
      if (response.status === 404) {
        await response.body?.cancel();
        return null;
      }
      if (!response.ok && response.status !== 403 && response.status !== 429) {
        await response.body?.cancel();
        throw new GitHubError("service");
      }
      const reader = response.body?.getReader();
      if (!reader) throw new GitHubError("invalid_response");
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > BODY_LIMIT) {
          await reader.cancel();
          throw new GitHubError("too_large");
        }
        chunks.push(value);
      }
      if (signal.aborted) throw new GitHubError("timeout");
      let data: unknown;
      try {
        data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        if (response.status === 403 || response.status === 429) {
          throw this.recordRateLimit(source, "unknown", reported);
        }
        throw new GitHubError("invalid_response");
      }
      if (response.status === 403 || response.status === 429) {
        const message = typeof data === "object" && data !== null && "message" in data &&
          typeof data.message === "string" ? data.message : "";
        if (/secondary|abuse/i.test(message) || reported.retryAfterSeconds !== undefined) {
          throw this.recordRateLimit(source, "secondary", reported);
        }
        if (reported.remaining === 0 && source) {
          throw this.recordRateLimit(source, "primary", reported);
        }
        if (response.status === 429 || /rate limit/i.test(message)) {
          throw this.recordRateLimit(source, "unknown", reported);
        }
        throw new GitHubError("auth");
      }
      return data;
    } catch (error) {
      if (error instanceof GitHubError) throw error;
      throw new GitHubError(signal.aborted ? "timeout" : "network");
    }
  }
}
