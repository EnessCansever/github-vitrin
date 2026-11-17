import {beforeEach, expect, it, vi} from "vitest";
import {analyze} from "../../src/features/analysis/actions";
import {acquireAnalysisCapacity} from "../../src/lib/db/analysis-capacity";
import {acquireAnalysisLock} from "../../src/lib/db/analysis-locks";
import {createSnapshot, createCachedSnapshot} from "../../src/lib/db/snapshots";
import {readAnalysisCache} from "../../src/lib/db/analysis-cache";
import {reportSchema} from "../../src/lib/db/snapshot-schema";
import {StorageError} from "../../src/lib/db/errors";
import {GitHubError} from "../../src/lib/github/errors";
import {scoreAnalysis} from "../../src/features/analysis/scoring/engine";
import {input, repo} from "../scoring/fixtures";

const state = vi.hoisted(() => ({profile: vi.fn(), repository: vi.fn(), readme: vi.fn(), profileReadme: vi.fn(), counter: 0, last: -Infinity,
  cache: null as null | {report: ReturnType<typeof reportSchema.parse>; snapshotCreatedAt: string; expiresAt: string}}));
vi.mock("../../src/lib/github/client", () => ({GitHubClient: vi.fn(function () {
  return {getProfile: state.profile, getRepository: state.repository, getReadme: state.readme, getProfileReadme: state.profileReadme};
})}));
vi.mock("../../src/lib/security/requests", () => ({limitRequest: vi.fn(async () => {}), limitAnalysis: vi.fn(async () => {
  if (Date.now() - state.last < 60000) throw Object.assign(new Error(), {retryAt: new Date(state.last + 60000).toISOString()});
  state.last = Date.now();
}), requestFailure: (error: unknown) => error instanceof Error && "retryAt" in error ? {code: "rateLimit" as const, retryAt: String(error.retryAt)} : null}));
vi.mock("../../src/lib/db/analysis-locks", async original => ({...await original<typeof import("../../src/lib/db/analysis-locks")>(),
  acquireAnalysisLock: vi.fn(async (key: string) => ({acquired: true, lock: {key, owner: "11111111-1111-4111-8111-111111111111", expiresAt: new Date(Date.now() + 45000).toISOString()}})),
  ownsAnalysisLock: async () => true, releaseAnalysisLock: async () => true,
}));
vi.mock("../../src/lib/db/analysis-capacity", () => ({acquireAnalysisCapacity: vi.fn(async () => ({acquired: true, permit: {owner: "22222222-2222-4222-8222-222222222222", expiresAt: new Date(Date.now() + 45000).toISOString()}})), ownsAnalysisCapacity: async () => true, releaseAnalysisCapacity: async () => true}));
vi.mock("../../src/lib/db/analysis-runs", () => ({failAnalysisRun: async () => {}, waitForAnalysis: async () => null}));
vi.mock("../../src/lib/db/analysis-cache", () => ({readAnalysisCache: vi.fn()}));
vi.mock("../../src/lib/db/snapshots", () => ({createSnapshot: vi.fn(), createCachedSnapshot: vi.fn(), createJoinedSnapshot: vi.fn()}));
vi.mock("../../src/features/analysis/scoring/engine", async original => {
  const engine = await original<typeof import("../../src/features/analysis/scoring/engine")>();
  return {...engine, scoreAnalysis: vi.fn(engine.scoreAnalysis)};
});
const selection = {username: "mira-sample", profileId: 1, repos: [{id: 10, name: "project-10"}]};
function access() {return {id: `private-${++state.counter}`, readToken: `private-token-${state.counter}`};}
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-17T00:00:00Z")); state.cache = null; state.last = -Infinity; state.counter = 0;
  const value = input();
  state.profile.mockReset().mockResolvedValue(value.profile); state.repository.mockReset().mockImplementation(async (_profile, _name, id: number) => repo(id));
  state.readme.mockReset().mockResolvedValue(value.repos[0].readme); state.profileReadme.mockReset().mockResolvedValue(value.profileReadme);
  vi.mocked(acquireAnalysisCapacity).mockClear(); vi.mocked(acquireAnalysisLock).mockClear(); vi.mocked(scoreAnalysis).mockClear();
  vi.mocked(readAnalysisCache).mockReset().mockImplementation(async () => state.cache && Date.parse(state.cache.expiresAt) > Date.now() ? {status: "hit", ...state.cache} : {status: "miss"});
  vi.mocked(createSnapshot).mockReset().mockImplementation(async value => {
    const report = reportSchema.parse(value);
    if (report.status === "complete") state.cache = {report, snapshotCreatedAt: new Date().toISOString(), expiresAt: new Date(Date.parse(report.checkedAt) + 900000).toISOString()};
    return access();
  });
  vi.mocked(createCachedSnapshot).mockReset().mockImplementation(async () => {
    if (!state.cache) throw new StorageError("lock_lost");
    return {...access(), report: {...state.cache.report, source: "cache"}};
  });
});

it("first analysis populates cache; reuse validates identity but skips lock, cooldown, README, engine and global permit", async () => {
  const first = await analyze(selection); const cached = structuredClone(state.cache);
  vi.advanceTimersByTime(1000);
  const next = await analyze(selection);
  expect(first).toMatchObject({status: "success", report: {source: "fresh"}});
  expect(next).toMatchObject({status: "success", report: {source: "cache", checkedAt: "2026-11-17T00:00:00.000Z"}});
  expect(state.profile).toHaveBeenCalledTimes(2); expect(state.repository).toHaveBeenCalledTimes(2);
  expect(state.readme).toHaveBeenCalledTimes(1); expect(scoreAnalysis).toHaveBeenCalledTimes(1);
  expect(acquireAnalysisCapacity).toHaveBeenCalledTimes(1); expect(acquireAnalysisLock).toHaveBeenCalledTimes(1);
  expect(state.cache).toEqual(cached);
  if (first.status !== "success" || next.status !== "success") throw new Error("Expected reports");
  expect(first.snapshot).not.toEqual(next.snapshot);
});

it("expired cache produces a new measured result instead of extending the old entry", async () => {
  await analyze(selection); vi.advanceTimersByTime(900000);
  expect(await analyze(selection)).toMatchObject({status: "success", report: {source: "fresh", checkedAt: "2026-11-17T00:15:00.000Z"}});
  expect(scoreAnalysis).toHaveBeenCalledTimes(2); expect(acquireAnalysisCapacity).toHaveBeenCalledTimes(2);
});

it("force refresh bypasses cache, honors 60 seconds and actually fetches changed GitHub data", async () => {
  const original = await analyze(selection); const cached = structuredClone(state.cache);
  expect(await analyze({...selection, force: true})).toMatchObject({status: "error", code: "rateLimit"});
  expect(state.cache).toEqual(cached); expect(original).toMatchObject({status: "success", report: {source: "fresh"}});
  vi.advanceTimersByTime(60000); state.repository.mockResolvedValue({...repo(), description: null});
  expect(await analyze({...selection, force: true})).toMatchObject({status: "success", report: {source: "refresh", checkedAt: "2026-11-17T00:01:00.000Z"}});
  expect(state.readme).toHaveBeenCalledTimes(2); expect(scoreAnalysis).toHaveBeenCalledTimes(2);
});

it("failed refresh leaves the previous cache and report access unchanged", async () => {
  const original = await analyze(selection); const cached = structuredClone(state.cache); vi.advanceTimersByTime(60000);
  state.profileReadme.mockRejectedValue(new GitHubError("network"));
  expect(await analyze({...selection, force: true})).toEqual({status: "error", code: "network"});
  expect(state.cache).toEqual(cached); expect(original).toMatchObject({snapshot: {status: "saved", id: "private-1"}});
});

it("does not reuse cache for a changed or ineligible identity and does not turn a DB error into a miss", async () => {
  await analyze(selection);
  expect(await analyze({...selection, profileId: 999})).toMatchObject({code: "selectionChanged"});
  vi.mocked(readAnalysisCache).mockRejectedValue(new StorageError("unavailable"));
  expect(await analyze(selection)).toEqual({status: "error", code: "unavailable"});
  expect(acquireAnalysisCapacity).toHaveBeenCalledTimes(1); expect(scoreAnalysis).toHaveBeenCalledTimes(1);
});

it("incomplete results remain incomplete and are not reused as complete cache", async () => {
  state.readme.mockResolvedValue({status: "unknown", error: new GitHubError("network")});
  expect(await analyze(selection)).toMatchObject({status: "success", report: {status: "incomplete", score: null}});
  expect(state.cache).toBeNull();
});
