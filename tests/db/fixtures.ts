import {scoreAnalysis} from "../../src/features/analysis/scoring/engine";
import type {Report} from "../../src/features/analysis/report";
import {GitHubError} from "../../src/lib/github/errors";
import {input} from "../scoring/fixtures";

export function report(count = 1, incomplete = false): Report {
  const value = input(count);
  value.repos[0].repo.description = null;
  if (incomplete) value.repos[0].readme = {status: "unknown", error: new GitHubError("network")};
  const result = scoreAnalysis(value);
  return {
    ...result, profile: {id: value.profile.id, login: value.profile.login},
    checkedAt: "2026-10-28T10:00:00Z", repoCount: count,
    checks: result.checks.map(check => ({...check, evidence: check.evidence.map(source => ({
      sourceUrl: source.sourceUrl, field: source.field, path: source.path, branch: source.branch,
      sha: source.sha, line: source.line, availability: source.availability, detailKey: source.detailKey,
    }))})),
  };
}
