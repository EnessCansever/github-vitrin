import {expect, it} from "vitest";
import {parseReportLink, rememberReport, reportHistory} from "../../src/features/reports/history";
const origin = "https://example.org";
const entry = {id: "11111111-1111-4111-8111-111111111111", readToken: "a".repeat(64), login: "mira-sample", checkedAt: "2026-11-17T00:00:00Z", expiresAt: "2026-12-17T00:00:00Z"};
it("keeps at most ten unique access identities and removes expired entries without storing reports", () => {
  let history = [entry];
  for (let n = 2; n < 14; n++) history = rememberReport(history, {...entry, id: `11111111-1111-4111-8111-${String(n).padStart(12, "0")}`});
  expect(history).toHaveLength(10);
  expect(rememberReport(history, history[2])).toHaveLength(10);
  expect(reportHistory(JSON.stringify(history), Date.parse("2026-11-17T01:00:00Z"))).toEqual(history);
  expect(reportHistory(JSON.stringify(history), Date.parse(entry.expiresAt))).toEqual([]);
  expect(reportHistory(JSON.stringify([{...entry, report: {score: 100}}]), 0)).toEqual([]);
  expect(reportHistory("broken", 0)).toEqual([]);
  expect(reportHistory(JSON.stringify(Array(11).fill(entry)), 0)).toEqual([]);
});
it("accepts only same-site private report links with a single fragment token", () => {
  const path = `/reports/${entry.id}#token=${entry.readToken}`;
  expect(parseReportLink(path, origin)).toEqual({id: entry.id, readToken: entry.readToken});
  expect(parseReportLink(origin + path, origin)).toEqual({id: entry.id, readToken: entry.readToken});
  for (const value of ["https://other.example" + path, "https://user:pass@example.org" + path, path + "&extra=1", path.replace("#", "?x=1#"), path.replace("#", "/extra#"), path.split("#")[0], "javascript:alert(1)"])
    expect(parseReportLink(value, origin)).toBeNull();
});
