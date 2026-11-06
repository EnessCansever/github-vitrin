import {beforeEach, expect, it, vi} from "vitest";
import {analyze} from "../../src/features/analysis/actions";
import {scoreAnalysis} from "../../src/features/analysis/scoring/engine";
import {acquireAnalysisLock, analysisScope, releaseAnalysisLock} from "../../src/lib/db/analysis-locks";
import type {AnalysisLock} from "../../src/lib/db/analysis-locks";
import {createSnapshot} from "../../src/lib/db/snapshots";
import {StorageError} from "../../src/lib/db/errors";
import {GitHubError} from "../../src/lib/github/errors";
import type {Readme} from "../../src/lib/github/client";
import {input, repo} from "../scoring/fixtures";

const state = vi.hoisted(() => ({locks: new Map<string, {key: string; owner: string; expiresAt: string}>(), sequence: 0}));
const github = vi.hoisted(() => ({profile: vi.fn(), repository: vi.fn(), readme: vi.fn(), profileReadme: vi.fn()}));
vi.mock("../../src/lib/db/analysis-runs", () => ({failAnalysisRun: vi.fn(async () => {}), waitForAnalysis: vi.fn(async () => null)}));
vi.mock("../../src/lib/db/analysis-capacity", () => ({
  acquireAnalysisCapacity: vi.fn(async () => ({acquired: true, permit: {
    owner: "22222222-2222-4222-8222-222222222222", expiresAt: new Date(Date.now() + 45000).toISOString(),
  }})),
  ownsAnalysisCapacity: vi.fn(async () => true), releaseAnalysisCapacity: vi.fn(async () => true),
}));
vi.mock("../../src/lib/github/client", () => ({GitHubClient: vi.fn(function () {
  return {getProfile: github.profile, getRepository: github.repository, getReadme: github.readme, getProfileReadme: github.profileReadme};
})}));
vi.mock("../../src/lib/security/requests", () => ({limitRequest: vi.fn(async () => {}), limitAnalysis: vi.fn(async () => {}), requestFailure: () => null}));
vi.mock("../../src/lib/db/snapshots", () => ({createSnapshot: vi.fn()}));
vi.mock("../../src/features/analysis/scoring/engine", async original => {
  const scoring = await original<typeof import("../../src/features/analysis/scoring/engine")>();
  return {...scoring, scoreAnalysis: vi.fn(scoring.scoreAnalysis)};
});
vi.mock("../../src/lib/db/analysis-locks", async original => ({
  ...await original<typeof import("../../src/lib/db/analysis-locks")>(),
  acquireAnalysisLock: vi.fn(), ownsAnalysisLock: async (lock: AnalysisLock) => state.locks.get(lock.key)?.owner === lock.owner,
  releaseAnalysisLock: vi.fn(),
}));
const selection = {username: "mira-sample", profileId: 1, repos: [{id: 10, name: "project-10"}]};

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-05T00:00:00Z"));
  state.locks.clear(); state.sequence = 0;
  vi.mocked(acquireAnalysisLock).mockReset().mockImplementation(async key => {
    const existing = state.locks.get(key);
    if (existing && Date.parse(existing.expiresAt) > Date.now()) return {acquired: false, retryAt: existing.expiresAt, lock: existing};
    const lock = {key, owner: `00000000-0000-4000-8000-${String(++state.sequence).padStart(12, "0")}`, expiresAt: new Date(Date.now() + 45000).toISOString()};
    state.locks.set(key, lock);
    return {acquired: true, lock};
  });
  vi.mocked(releaseAnalysisLock).mockReset().mockImplementation(async lock => {
    if (state.locks.get(lock.key)?.owner !== lock.owner) return false;
    state.locks.delete(lock.key); return true;
  });
  const value = input();
  github.profile.mockReset().mockResolvedValue(value.profile);
  github.repository.mockReset().mockImplementation(async (_profile, _name, id: number) => repo(id));
  github.readme.mockReset().mockResolvedValue(value.repos[0].readme);
  github.profileReadme.mockReset().mockResolvedValue(value.profileReadme);
  vi.mocked(createSnapshot).mockReset().mockResolvedValue({id: "11111111-1111-4111-8111-111111111111", readToken: "a".repeat(64)});
  vi.mocked(scoreAnalysis).mockClear();
});

it("runs one analysis for concurrent identical scopes and skips README/scoring/storage for the contender", async () => {
  const gate = Promise.withResolvers<Readme>(), entered = Promise.withResolvers<void>();
  github.profileReadme.mockImplementationOnce(() => {entered.resolve(); return gate.promise;});
  const first = analyze(selection);
  await entered.promise;
  expect(await analyze(selection)).toEqual({status: "error", code: "busy", retryAt: "2026-11-05T00:00:45.000Z"});
  expect(github.profile).toHaveBeenCalledTimes(2);
  expect(github.repository).toHaveBeenCalledTimes(2);
  expect(github.readme).toHaveBeenCalledTimes(1);
  expect(scoreAnalysis).not.toHaveBeenCalled();
  expect(createSnapshot).not.toHaveBeenCalled();
  gate.resolve(input().profileReadme);
  expect(await first).toMatchObject({status: "success"});
  expect(scoreAnalysis).toHaveBeenCalledTimes(1);
  expect(createSnapshot).toHaveBeenCalledTimes(1);
  expect(state.locks.size).toBe(0);
});

it("does not block another verified repo set while the first analysis is pending", async () => {
  const gate = Promise.withResolvers<Readme>(), entered = Promise.withResolvers<void>();
  github.profileReadme.mockImplementationOnce(() => {entered.resolve(); return gate.promise;});
  const first = analyze(selection); await entered.promise;
  expect(await analyze({...selection, repos: [{id: 11, name: "project-11"}]})).toMatchObject({status: "success"});
  expect(state.locks.size).toBe(1);
  gate.resolve(input().profileReadme); await first;
  expect(scoreAnalysis).toHaveBeenCalledTimes(2);
});

it("cannot bypass the lock by reordering selected repositories", async () => {
  const gate = Promise.withResolvers<Readme>(), entered = Promise.withResolvers<void>();
  github.profileReadme.mockImplementationOnce(() => {entered.resolve(); return gate.promise;});
  const repos = [{id: 10, name: "project-10"}, {id: 11, name: "project-11"}];
  const first = analyze({...selection, repos}); await entered.promise;
  expect(await analyze({...selection, repos: [...repos].reverse()})).toMatchObject({code: "busy"});
  expect(vi.mocked(acquireAnalysisLock).mock.calls.map(([key]) => key)).toEqual([analysisScope(1, [10, 11]), analysisScope(1, [11, 10])]);
  expect(github.readme).toHaveBeenCalledTimes(2);
  gate.resolve(input().profileReadme); await first;
});

it("does not use an unverified profile claim as a lock key", async () => {
  expect(await analyze({...selection, profileId: 999})).toEqual({status: "error", code: "selectionChanged"});
  expect(acquireAnalysisLock).not.toHaveBeenCalled();
  expect(github.readme).not.toHaveBeenCalled();
});

it("releases the owner after an error, permitting subsequent lock acquisition", async () => {
  github.readme.mockRejectedValueOnce(new GitHubError("network"));
  expect(await analyze(selection)).toMatchObject({code: "network"});
  expect(state.locks.size).toBe(0);
  expect(await analyze(selection)).toMatchObject({status: "success"});
  expect(releaseAnalysisLock).toHaveBeenCalledTimes(2);
});

it("rejects an old operation after expiry without deleting or writing under the new owner", async () => {
  const oldGate = Promise.withResolvers<Readme>(), newGate = Promise.withResolvers<Readme>();
  const oldEntered = Promise.withResolvers<void>(), newEntered = Promise.withResolvers<void>();
  github.profileReadme.mockImplementationOnce(() => {oldEntered.resolve(); return oldGate.promise;})
    .mockImplementationOnce(() => {newEntered.resolve(); return newGate.promise;});
  const first = analyze(selection); await oldEntered.promise;
  const oldOwner = state.locks.get(analysisScope(1, [10]))?.owner;
  vi.advanceTimersByTime(60001);
  const next = analyze(selection); await newEntered.promise;
  const newOwner = state.locks.get(analysisScope(1, [10]))?.owner;
  expect(newOwner).not.toBe(oldOwner);
  oldGate.resolve(input().profileReadme);
  expect(await first).toEqual({status: "error", code: "analysisExpired"});
  expect(state.locks.get(analysisScope(1, [10]))?.owner).toBe(newOwner);
  expect(scoreAnalysis).not.toHaveBeenCalled();
  expect(createSnapshot).not.toHaveBeenCalled();
  newGate.resolve(input().profileReadme);
  expect(await next).toMatchObject({status: "success"});
  expect(createSnapshot).toHaveBeenCalledTimes(1);
});

it("does not report lease loss at the final storage fence as a saved result", async () => {
  vi.mocked(createSnapshot).mockRejectedValueOnce(new StorageError("lock_lost"));
  expect(await analyze(selection)).toEqual({status: "error", code: "analysisExpired"});
  expect(state.locks.size).toBe(0);
});

it.each(["configuration", "unavailable"] as const)("does not show a lock %s error as contention", async code => {
  vi.mocked(acquireAnalysisLock).mockRejectedValue(new StorageError(code));
  expect(await analyze(selection)).toEqual({status: "error", code});
  expect(github.readme).not.toHaveBeenCalled();
  expect(scoreAnalysis).not.toHaveBeenCalled();
  expect(createSnapshot).not.toHaveBeenCalled();
});

it("keeps a saved result if cleanup fails, emits only a safe diagnostic, and leaves expiry recovery", async () => {
  const log = vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.mocked(releaseAnalysisLock).mockRejectedValue(new Error("sensitive database diagnostic"));
  expect(await analyze(selection)).toMatchObject({status: "success", snapshot: {status: "saved"}});
  expect(log).toHaveBeenCalledWith("analysis_lock_release_failed", expect.objectContaining({errorType: "unavailable", durationMs: expect.any(Number)}));
  const serialized = JSON.stringify(log.mock.calls);
  expect(serialized).not.toContain("sensitive");
  expect(serialized).not.toContain(state.locks.get(analysisScope(1, [10]))?.owner);
});
