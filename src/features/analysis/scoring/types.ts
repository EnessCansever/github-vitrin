import type {Readme} from "../../../lib/github/client";
import type {ErrorCode} from "../../../lib/github/errors";
import type {Profile, Repository} from "../../../lib/github/schemas";

export type Rule = "bio" | "website" | "profileReadme" | "description" | "topics" |
  "demo" | "image" | "readme" | "purpose" | "install" | "usage" | "technology" | "features";
export type CategoryId = "profile" | "projects" | "readme";
export type CheckStatus = "pass" | "fail" | "unknown" | "not_applicable";
export type Scope = {kind: "profile" | "repo"; id: number; name: string};
export type Evidence = {
  sourceUrl: string;
  field: string;
  repo?: {id?: number; fullName: string};
  path?: string;
  branch?: string;
  sha?: string;
  checkedAt?: string;
  line?: number;
  excerpt?: string;
  availability?: Readme["status"];
  errorCode?: ErrorCode;
  detailKey: string;
};
export type Check = {
  id: string;
  rulesVersion: string;
  rule: Rule;
  category: CategoryId;
  scope: Scope;
  status: CheckStatus;
  earned: number | null;
  max: number;
  evidence: Evidence[];
  suggestionKey: Rule;
};
export type Category = {
  id: CategoryId;
  status: "complete" | "incomplete";
  rawScore: number | null;
  score: number | null;
  max: number;
};
export type Recommendation = {
  checkId: string;
  target: Scope;
  suggestionKey: Rule;
  rawImpact: number;
  categoryImpact: number | null;
};
export type ProfileType = {
  id: "ready" | "noDemo" | "hiddenGem" | "inProgress";
  checkIds: string[];
};
export type AnalysisInput = {
  rulesVersion: string;
  profile: Profile;
  profileReadme: Readme;
  repos: readonly {repo: Repository; readme: Readme}[];
  checkedAt?: string;
};
export type AnalysisResult = {
  rulesVersion: string;
  status: "complete" | "incomplete";
  score: number | null;
  checks: Check[];
  categories: Category[];
  profileType: ProfileType | null;
  recommendations: Recommendation[];
};
