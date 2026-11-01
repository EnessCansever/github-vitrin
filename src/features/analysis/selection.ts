export type RepoOption = {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  pinned: boolean;
};

export type SearchError = "invalid_input" | "notFound" | "empty" | "network" | "rateLimit" | "configuration" | "unavailable";

export type SearchResult =
  | {status: "error"; code: SearchError; retryAt?: string}
  | {
    status: "success";
    profile: {id: number; login: string};
    repos: RepoOption[];
    initialSelectedIds: string[];
    pinnedUnknown: boolean;
    limited: boolean;
  };
