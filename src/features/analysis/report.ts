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
export type AnalysisResponse = {status: "success"; report: Report} | {status: "error"; code: AnalysisError};
