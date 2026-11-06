import {beforeEach, expect, it, vi} from "vitest";
import {analyze} from "../../src/features/analysis/actions";
import {scoreAnalysis} from "../../src/features/analysis/scoring/engine";
import {acquireAnalysisCapacity} from "../../src/lib/db/analysis-capacity";
import {analysisScope, type AnalysisLock} from "../../src/lib/db/analysis-locks";
import type {AnalysisRun} from "../../src/lib/db/analysis-runs";
import {createSnapshot, createJoinedSnapshot} from "../../src/lib/db/snapshots";
import {limitRequest, limitAnalysis} from "../../src/lib/security/requests";
import {reportSchema} from "../../src/lib/db/snapshot-schema";
import {GitHubError} from "../../src/lib/github/errors";
import {input, repo} from "../scoring/fixtures";

const state = vi.hoisted(() => ({locks: new Map<string, AnalysisLock>(), runs: new Map<string, AnalysisRun>(), sequence: 0, access: 0,
  profile: vi.fn(), repository: vi.fn(), readme: vi.fn(), profileReadme: vi.fn(), find: vi.fn()}));
vi.mock("../../src/lib/github/client", () => ({GitHubClient: vi.fn(function () {
  return {getProfile: state.profile, getRepository: state.repository, getReadme: state.readme, getProfileReadme: state.profileReadme};
})}));
vi.mock("../../src/lib/security/requests", () => ({limitRequest: vi.fn(async () => {}), limitAnalysis: vi.fn(async () => {}), requestFailure: () => null}));
vi.mock("../../src/lib/db/client", async original => ({...await original<typeof import("../../src/lib/db/client")>(), getDatabase: async () => ({collection: (name: string) => {
  if (name !== "analysisRuns") throw new Error("Unexpected collection");
  return {findOne: state.find};
}})}));
vi.mock("../../src/lib/db/analysis-capacity", () => ({acquireAnalysisCapacity: vi.fn(async () => ({acquired: true, permit: {
  owner: "22222222-2222-4222-8222-222222222222", expiresAt: new Date(Date.now() + 45000).toISOString(),
}})), ownsAnalysisCapacity: async () => true, releaseAnalysisCapacity: vi.fn(async () => true)}));
vi.mock("../../src/lib/db/analysis-locks", async original => ({...await original<typeof import("../../src/lib/db/analysis-locks")>(),
  acquireAnalysisLock: async (key: string) => {
    const existing = state.locks.get(key);
    if (existing) return {acquired: false, lock: existing, retryAt: existing.expiresAt};
    const lock = {key, owner: `00000000-0000-4000-8000-${String(++state.sequence).padStart(12, "0")}`, expiresAt: new Date(Date.now() + 45000).toISOString()};
    state.locks.set(key, lock); return {acquired: true, lock};
  }, ownsAnalysisLock: async (lock: AnalysisLock) => state.locks.get(lock.key)?.owner === lock.owner,
  releaseAnalysisLock: async (lock: AnalysisLock) => state.locks.get(lock.key)?.owner === lock.owner && state.locks.delete(lock.key),
}));
vi.mock("../../src/lib/db/analysis-runs", async original => ({...await original<typeof import("../../src/lib/db/analysis-runs")>(),
  failAnalysisRun: async (lock: AnalysisLock, rulesVersion: string, outcome: AnalysisRun["outcome"]) => {
    if (!state.runs.has(lock.owner)) state.runs.set(lock.owner, {_id: lock.owner, scope: lock.key, rulesVersion, completedAt: new Date(), expiresAt: new Date(lock.expiresAt), outcome});
  },
}));
vi.mock("../../src/lib/db/snapshots", () => ({createSnapshot: vi.fn(), createJoinedSnapshot: vi.fn()}));
vi.mock("../../src/features/analysis/scoring/engine", async original => {
  const scoring = await original<typeof import("../../src/features/analysis/scoring/engine")>();
  return {...scoring, scoreAnalysis: vi.fn(scoring.scoreAnalysis)};
});
const selection = {username: "mira-sample", profileId: 1, repos: [{id: 10, name: "project-10"}, {id: 11, name: "project-11"}]};
function access() {return {id: `private-report-${++state.access}`, readToken: `synthetic-private-${state.access}`};}
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-07T00:00:00Z"));
  state.locks.clear(); state.runs.clear(); state.sequence = 0; state.access = 0;
  const value = input();
  state.profile.mockReset().mockResolvedValue(value.profile);
  state.repository.mockReset().mockImplementation(async (_profile, _name, id: number) => repo(id));
  state.readme.mockReset().mockResolvedValue(value.repos[0].readme);
  state.profileReadme.mockReset().mockResolvedValue(value.profileReadme);
  state.find.mockReset().mockImplementation(async filter => state.runs.get(filter._id) ?? null);
  vi.mocked(acquireAnalysisCapacity).mockClear(); vi.mocked(limitRequest).mockClear(); vi.mocked(limitAnalysis).mockClear(); vi.mocked(scoreAnalysis).mockClear();
  vi.mocked(createSnapshot).mockReset().mockImplementation(async (report, lock) => {
    if (!lock) throw new Error("Expected leader lock");
    state.runs.set(lock.owner, {_id: lock.owner, scope: lock.key, rulesVersion: "1.0.0", completedAt: new Date(), expiresAt: new Date(lock.expiresAt), outcome: {status: "success", report: reportSchema.parse(report)}});
    return access();
  });
  vi.mocked(createJoinedSnapshot).mockReset().mockImplementation(async lock => {
    const run = state.runs.get(lock.owner);
    if (!run || run.outcome.status !== "success") throw new Error("Expected published report");
    return {...access(), report: run.outcome.report};
  });
});

it.each([false, true])("coalesces reordered selections into one permit/data fetch/score with isolated access; incomplete=%s", async incomplete => {
  const entered = Promise.withResolvers<void>(), waitRead = Promise.withResolvers<void>();
  const gate = Promise.withResolvers<ReturnType<typeof input>["profileReadme"]>();
  state.profileReadme.mockImplementationOnce(() => {entered.resolve(); return gate.promise;});
  if (incomplete) state.readme.mockResolvedValue({status: "unknown", error: new GitHubError("network")});
  const first = analyze(selection); await entered.promise;
  state.find.mockImplementation(async filter => {waitRead.resolve(); return state.runs.get(filter._id) ?? null;});
  const second = analyze({...selection, repos: [...selection.repos].reverse()}); await waitRead.promise;
  expect(acquireAnalysisCapacity).toHaveBeenCalledTimes(1);
  expect(state.readme).toHaveBeenCalledTimes(2);
  expect(state.profile).toHaveBeenCalledTimes(2);
  gate.resolve(input().profileReadme);
  const leader = await first;
  await vi.advanceTimersByTimeAsync(1000);
  const follower = await second;
  expect(leader.status).toBe("success"); expect(follower.status).toBe("success");
  if (leader.status !== "success" || follower.status !== "success" || leader.snapshot.status !== "saved" || follower.snapshot.status !== "saved") throw new Error("Expected separate saved reports");
  expect(leader.report).toEqual(follower.report);
  expect(leader.report.status).toBe(incomplete ? "incomplete" : "complete");
  expect(follower.snapshot.id).not.toBe(leader.snapshot.id); expect(follower.snapshot.readToken).not.toBe(leader.snapshot.readToken);
  expect(scoreAnalysis).toHaveBeenCalledTimes(1); expect(limitRequest).toHaveBeenCalledTimes(2); expect(limitAnalysis).toHaveBeenCalledTimes(1);
  expect(createSnapshot).toHaveBeenCalledTimes(1); expect(createJoinedSnapshot).toHaveBeenCalledTimes(1);
  expect(state.locks.size).toBe(0);
});

it("does not join a different verified repo set", async () => {
  const entered = Promise.withResolvers<void>(), gate = Promise.withResolvers<ReturnType<typeof input>["profileReadme"]>();
  state.profileReadme.mockImplementationOnce(() => {entered.resolve(); return gate.promise;});
  const first = analyze(selection); await entered.promise;
  expect(await analyze({...selection, repos: [{id: 12, name: "project-12"}]})).toMatchObject({status: "success"});
  expect(acquireAnalysisCapacity).toHaveBeenCalledTimes(2); expect(createJoinedSnapshot).not.toHaveBeenCalled();
  gate.resolve(input().profileReadme); await first;
});

it("passes on leader failure without another permit, score or snapshot", async () => {
  const entered = Promise.withResolvers<void>(), waitRead = Promise.withResolvers<void>();
  const gate = Promise.withResolvers<ReturnType<typeof input>["profileReadme"]>();
  state.profileReadme.mockImplementationOnce(() => {entered.resolve(); return gate.promise;});
  const first = analyze(selection); await entered.promise;
  state.find.mockImplementation(async filter => {waitRead.resolve(); return state.runs.get(filter._id) ?? null;});
  const second = analyze(selection); await waitRead.promise;
  gate.reject(new GitHubError("network"));
  expect(await first).toEqual({status: "error", code: "network"});
  await vi.advanceTimersByTimeAsync(1000);
  expect(await second).toEqual({status: "error", code: "network"});
  expect(acquireAnalysisCapacity).toHaveBeenCalledTimes(1); expect(scoreAnalysis).not.toHaveBeenCalled(); expect(createJoinedSnapshot).not.toHaveBeenCalled();
  expect(state.locks.size).toBe(0);
});

it("ends bounded waiting when the leader process has vanished instead of electing a second analysis", async () => {
  const lock = {key: analysisScope(1, [10, 11]), owner: "33333333-3333-4333-8333-333333333333", expiresAt: new Date(Date.now() + 45000).toISOString()};
  state.locks.set(lock.key, lock);
  const joined = analyze(selection);
  await vi.advanceTimersByTimeAsync(8000);
  expect(await joined).toEqual({status: "error", code: "busy", retryAt: lock.expiresAt});
  expect(acquireAnalysisCapacity).not.toHaveBeenCalled(); expect(state.profileReadme).not.toHaveBeenCalled();
  expect(createSnapshot).not.toHaveBeenCalled();
});
