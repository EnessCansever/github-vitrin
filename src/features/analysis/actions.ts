"use server";

import {z} from "zod";
import {GitHubClient} from "../../lib/github/client";
import {GitHubError} from "../../lib/github/errors";
import {profileInput} from "../../lib/github/input";
import {repoName} from "../../lib/github/schemas";
import {createSnapshot} from "../../lib/db/snapshots";
import {RULES_VERSION, scoreAnalysis} from "./scoring/engine";
import type {AnalysisResponse, Report} from "./report";
import type {SearchError, SearchResult} from "./selection";

export async function getRepos(input: unknown): Promise<SearchResult> {
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
  const parsed = analysisInput.safeParse(input);
  if (!parsed.success || Buffer.byteLength(JSON.stringify(input), "utf8") > 2048) {
    return {status: "error", code: "invalid_input"};
  }
  try {
    const client = new GitHubClient();
    const profile = await client.getProfile(parsed.data.username);
    if (profile.id !== parsed.data.profileId || profile.login.toLowerCase() !== parsed.data.username) return {status: "error", code: "selectionChanged"};
    const repos = await client.getSelected(profile, parsed.data.repos);
    const profileReadme = await client.getProfileReadme(profile);
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
      const access = await createSnapshot(report);
      return {status: "success", report, snapshot: {status: "saved", ...access}};
    } catch {
      return {status: "success", report, snapshot: {status: "failed"}};
    }
  } catch (error) {
    if (error instanceof GitHubError && error.code === "repo_unavailable") {
      return {status: "error", code: "selectionChanged"};
    }
    return {status: "error", code: safeError(error)};
  }
}
