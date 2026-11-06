"use server";

import {z} from "zod";
import {randomUUID} from "node:crypto";
import {GitHubClient} from "../../lib/github/client";
import {GitHubError} from "../../lib/github/errors";
import {profileInput} from "../../lib/github/input";
import {repoName, type Repository} from "../../lib/github/schemas";
import {acquireAnalysisCapacity, ownsAnalysisCapacity, releaseAnalysisCapacity, type AnalysisPermit} from "../../lib/db/analysis-capacity";
import {createSnapshot} from "../../lib/db/snapshots";
import {StorageError} from "../../lib/db/errors";
import {acquireAnalysisLock, analysisScope, ownsAnalysisLock, releaseAnalysisLock, type AnalysisLock} from "../../lib/db/analysis-locks";
import {limitRequest, limitAnalysis, requestFailure} from "../../lib/security/requests";
import {RULES_VERSION, scoreAnalysis} from "./scoring/engine";
import type {AnalysisResponse, Report} from "./report";
import type {SearchError, SearchResult} from "./selection";

export async function getRepos(input: unknown): Promise<SearchResult> {
  try {
    await limitRequest("search");
  } catch (error) {
    return {status: "error", ...(requestFailure(error) ?? {code: "unavailable" as const})};
  }
  if (typeof input !== "string" || Buffer.byteLength(input, "utf8") > 256) {
    return {status: "error", code: "invalid_input"};
  }
  const parsed = profileInput.safeParse(input);
  if (!parsed.success) return {status: "error", code: "invalid_input"};
  try {
    const client = new GitHubClient();
    const profile = await client.getProfile(parsed.data);
    const pinned = await client.getPinned(profile);
    const candidates = await client.getCandidates(profile, pinned);
    const pinnedIds = new Set(pinned.status === "available" ? pinned.repos.map(repo => repo.id) : []);
    const repos = candidates.repos.map(repo => ({
      id: String(repo.id), name: repo.name, description: repo.description?.slice(0, 350) ?? null,
      language: repo.language?.slice(0, 60) ?? null, pinned: pinnedIds.has(repo.id),
    }));
    return {
      status: "success", profile: {id: profile.id, login: profile.login}, repos,
      initialSelectedIds: repos.slice(0, 3).map(repo => repo.id),
      pinnedUnknown: pinned.status === "unknown", limited: candidates.limited,
    };
  } catch (error) {
    return {status: "error", code: safeError(error)};
  }
}

function safeError(error: unknown): SearchError {
  if (error instanceof GitHubError) {
    switch (error.code) {
      case "invalid_input": return "invalid_input";
      case "user_not_found": return "notFound";
      case "no_repos": return "empty";
      case "configuration": case "auth": return "configuration";
      case "rate_limit": return "rateLimit";
    }
  }
  return "network";
}

const analysisInput = z.object({
  username: z.string().max(256).refine(value => Buffer.byteLength(value, "utf8") <= 256).pipe(profileInput),
  profileId: z.number().int().positive().safe(),
  repos: z.array(z.object({id: z.number().int().positive().safe(), name: repoName}).strict()).min(1).max(3)
    .refine(repos => new Set(repos.map(repo => repo.id)).size === repos.length &&
      new Set(repos.map(repo => repo.name.toLowerCase())).size === repos.length),
}).strict();

export async function analyze(input: unknown): Promise<AnalysisResponse> {
  try {
    await limitRequest("analysis");
  } catch (error) {
    return {status: "error", ...(requestFailure(error) ?? {code: "unavailable" as const})};
  }
  const parsed = analysisInput.safeParse(input);
  if (!parsed.success || Buffer.byteLength(JSON.stringify(input), "utf8") > 2048) {
    return {status: "error", code: "invalid_input"};
  }
  const startedAt = Date.now();
  let lock: AnalysisLock | undefined;
  let permit: AnalysisPermit | undefined;
  function checkDeadline() {
    if (Date.now() - startedAt >= 20_000) throw new StorageError("lock_lost");
  }
  try {
    const capacity = await acquireAnalysisCapacity();
    if (!capacity.acquired) return {status: "error", code: "capacity", retryAt: capacity.retryAt};
    permit = capacity.permit;
    checkDeadline();
    const client = new GitHubClient();
    const profile = await client.getProfile(parsed.data.username);
    if (profile.id !== parsed.data.profileId || profile.login.toLowerCase() !== parsed.data.username) return {status: "error", code: "selectionChanged"};
    const metadata: Repository[] = [];
    for (const selected of parsed.data.repos) metadata.push(await client.getRepository(profile, selected.name, selected.id));
    checkDeadline();
    const scope = analysisScope(profile.id, metadata.map(repo => repo.id));
    const acquired = await acquireAnalysisLock(scope);
    if (!acquired.acquired) return {status: "error", code: "busy", retryAt: acquired.retryAt};
    lock = acquired.lock;
    await limitAnalysis(scope);
    checkDeadline();
    const repos = [];
    for (const repo of metadata) repos.push({repo, readme: await client.getReadme(profile, repo)});
    const profileReadme = await client.getProfileReadme(profile);
    checkDeadline();
    if (!(await ownsAnalysisCapacity(permit)) || !(await ownsAnalysisLock(lock))) throw new StorageError("lock_lost");
    checkDeadline();
    const checkedAt = new Date().toISOString();
    const result = scoreAnalysis({rulesVersion: RULES_VERSION, profile, profileReadme, repos, checkedAt});
    const report: Report = {
      ...result, profile: {id: profile.id, login: profile.login}, checkedAt, repoCount: repos.length,
      checks: result.checks.map(check => ({...check, evidence: check.evidence.map(evidence => ({
        sourceUrl: evidence.sourceUrl, field: evidence.field, path: evidence.path,
        branch: evidence.branch, sha: evidence.sha, line: evidence.line,
        availability: evidence.availability, detailKey: evidence.detailKey,
      }))})),
    };
    try {
      checkDeadline();
      const access = await createSnapshot(report, lock, permit);
      return {status: "success", report, snapshot: {status: "saved", ...access}};
    } catch (error) {
      if (error instanceof StorageError && error.code === "lock_lost") throw error;
      return {status: "success", report, snapshot: {status: "failed"}};
    }
  } catch (error) {
    const limited = requestFailure(error);
    if (limited) return {status: "error", ...limited};
    if (error instanceof StorageError) {
      return {status: "error", code: error.code === "lock_lost" ? "analysisExpired" : error.code === "configuration" ? "configuration" : "unavailable"};
    }
    if (error instanceof GitHubError && error.code === "repo_unavailable") {
      return {status: "error", code: "selectionChanged"};
    }
    return {status: "error", code: safeError(error)};
  } finally {
    if (lock) {
      try {
        await releaseAnalysisLock(lock);
      } catch (error) {
        console.warn("analysis_lock_release_failed", {
          errorType: error instanceof StorageError ? error.code : "unavailable",
          correlationId: randomUUID(), durationMs: Date.now() - startedAt,
        });
      }
    }
    if (permit) {
      try {
        await releaseAnalysisCapacity(permit);
      } catch (error) {
        console.warn("analysis_capacity_release_failed", {
          errorType: error instanceof StorageError ? error.code : "unavailable",
          correlationId: randomUUID(), durationMs: Date.now() - startedAt,
        });
      }
    }
  }
}
