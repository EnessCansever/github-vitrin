"use server";

import {GitHubClient} from "../../lib/github/client";
import {GitHubError} from "../../lib/github/errors";
import {profileInput} from "../../lib/github/input";
import type {SearchResult} from "./selection";

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
    if (error instanceof GitHubError) {
      switch (error.code) {
        case "invalid_input": return {status: "error", code: "invalid_input"};
        case "user_not_found": return {status: "error", code: "notFound"};
        case "no_repos": return {status: "error", code: "empty"};
        case "configuration": case "auth": return {status: "error", code: "configuration"};
        case "rate_limit": return {status: "error", code: "rateLimit"};
      }
    }
    return {status: "error", code: "network"};
  }
}
