import type {AnalysisResult, Check, Evidence} from "./scoring/types";
import type {SearchError} from "./selection";

export type Report = Omit<AnalysisResult, "checks"> & {
  profile: {id: number; login: string};
  checkedAt: string;
  repoCount: number;
  checks: (Omit<Check, "evidence"> & {
    evidence: Pick<Evidence, "sourceUrl" | "field" | "path" | "branch" | "sha" | "line" | "availability" | "detailKey">[];
  })[];
};
export type AnalysisError = SearchError | "selectionChanged";
export type SnapshotAccess = {id: string; readToken: string};
export type AnalysisResponse = {
  status: "success";
  report: Report;
  snapshot: ({status: "saved"} & SnapshotAccess) | {status: "failed"};
} | {status: "error"; code: AnalysisError};

export type StoredReportResponse = {
  status: "success"; report: Report; expiresAt: string;
} | {status: "missing" | "unavailable"};
