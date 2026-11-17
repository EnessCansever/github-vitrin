import type {CategoryId, ProfileType, Rule} from "../analysis/scoring/types";

export type ShareSummary = {
  profile: {login: string};
  checkedAt: string;
  rulesVersion: string;
  repos: string[];
  status: "complete" | "incomplete";
  score: number | null;
  profileType: ProfileType["id"] | null;
  categories: {id: CategoryId; score: number | null; max: number}[];
  firstTask: {suggestionKey: Rule; target: {kind: "profile" | "repo"; name: string}; impact: number | null} | null;
};
export type PublicShare = {id: string; createdAt: string; expiresAt: string; summary: ShareSummary};
export type ShareFailure = {status: "error"; code: "invalid" | "missing" | "unavailable" | "configuration" | "rateLimit" | "origin"; retryAt?: string};
export type ShareAccess = {id: string; managementToken: string; expiresAt: string};
