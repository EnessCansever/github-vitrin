export type ErrorCode =
  | "configuration" | "invalid_input" | "user_not_found" | "no_repos"
  | "repo_unavailable" | "auth" | "rate_limit" | "network" | "timeout"
  | "service" | "graphql" | "partial" | "invalid_response" | "request_budget" | "too_large";

export type RateResource = "core" | "graphql";

export type RateLimit = {
  resource?: RateResource;
  scope?: "primary" | "secondary" | "unknown";
  remaining?: number;
  resetAt?: number;
  retryAfterSeconds?: number;
};

export class GitHubError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly rateLimit?: RateLimit,
  ) {
    super(`GitHub: ${code}`);
    this.name = "GitHubError";
  }
}
