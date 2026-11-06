import {beforeEach, expect, it, vi} from "vitest";
import {analyze} from "../../src/features/analysis/actions";
import {acquireAnalysisCapacity, releaseAnalysisCapacity} from "../../src/lib/db/analysis-capacity";
import {limitRequest, limitAnalysis} from "../../src/lib/security/requests";
import {createSnapshot} from "../../src/lib/db/snapshots";
import {StorageError} from "../../src/lib/db/errors";
import {GitHubError} from "../../src/lib/github/errors";
import {analysisCapacityLimit} from "../../src/config/request-limits";
import {input, repo} from "../scoring/fixtures";

const state = vi.hoisted(() => ({permits: new Map<string, number>(), sequence: 0}));
const github = vi.hoisted(() => ({profile: vi.fn(), repository: vi.fn(), readme: vi.fn(), profileReadme: vi.fn()}));
vi.mock("../../src/lib/db/analysis-runs", () => ({failAnalysisRun: vi.fn(async () => {}), waitForAnalysis: vi.fn(async () => null)}));
vi.mock("../../src/lib/github/client", () => ({GitHubClient: vi.fn(function () {
  return {getProfile: github.profile, getRepository: github.repository, getReadme: github.readme, getProfileReadme: github.profileReadme};
})}));
vi.mock("../../src/lib/security/requests", () => ({limitRequest: vi.fn(async () => {}), limitAnalysis: vi.fn(async () => {}), requestFailure: () => null}));
vi.mock("../../src/lib/db/analysis-capacity", () => ({
  acquireAnalysisCapacity: vi.fn(), releaseAnalysisCapacity: vi.fn(),
  ownsAnalysisCapacity: async (permit: {owner: string}) => (state.permits.get(permit.owner) ?? 0) > Date.now(),
}));
vi.mock("../../src/lib/db/analysis-locks", async original => ({
  ...await original<typeof import("../../src/lib/db/analysis-locks")>(),
  acquireAnalysisLock: async (key: string) => ({acquired: true, lock: {key, owner: "11111111-1111-4111-8111-111111111111", expiresAt: new Date(Date.now() + 45000).toISOString()}}),
  ownsAnalysisLock: async () => true, releaseAnalysisLock: async () => true,
}));
vi.mock("../../src/lib/db/snapshots", () => ({createSnapshot: vi.fn()}));
const selection = {username: "mira-sample", profileId: 1, repos: [{id: 10, name: "project-10"}]};

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-07T00:00:00Z"));
  state.permits.clear(); state.sequence = 0;
  vi.mocked(limitRequest).mockClear(); vi.mocked(limitAnalysis).mockClear();
  vi.mocked(acquireAnalysisCapacity).mockReset().mockImplementation(async () => {
    for (const [owner, expiry] of state.permits) if (expiry <= Date.now()) state.permits.delete(owner);
    if (state.permits.size >= analysisCapacityLimit) return {acquired: false, retryAt: new Date(Math.min(...state.permits.values())).toISOString()};
    const owner = `00000000-0000-4000-8000-${String(++state.sequence).padStart(12, "0")}`;
    const expiry = Date.now() + 45000;
    state.permits.set(owner, expiry);
    return {acquired: true, permit: {owner, expiresAt: new Date(expiry).toISOString()}};
  });
  vi.mocked(releaseAnalysisCapacity).mockReset().mockImplementation(async permit => state.permits.delete(permit.owner));
  const value = input();
  github.profile.mockReset().mockResolvedValue(value.profile);
  github.repository.mockReset().mockImplementation(async (_profile, _name, id: number) => repo(id));
  github.readme.mockReset().mockResolvedValue(value.repos[0].readme);
  github.profileReadme.mockReset().mockResolvedValue(value.profileReadme);
  vi.mocked(createSnapshot).mockReset().mockResolvedValue({id: "11111111-1111-4111-8111-111111111111", readToken: "synthetic-access"});
});

it("admits five different scopes and rejects the sixth before extra README/scoring work", async () => {
  const ready = Promise.withResolvers<void>(), finish = Promise.withResolvers<ReturnType<typeof input>["profileReadme"]>();
  github.profileReadme.mockImplementation(() => {
    if (github.profileReadme.mock.calls.length === 5) ready.resolve();
    return finish.promise;
  });
  const calls = Array.from({length: 5}, (_, i) => analyze({...selection, repos: [{id: 10 + i, name: `project-${10 + i}`}]}));
  await ready.promise;
  expect(await analyze(selection)).toEqual({status: "error", code: "capacity", retryAt: "2026-11-07T00:00:45.000Z"});
  expect(github.profile).toHaveBeenCalledTimes(6);
  expect(github.repository).toHaveBeenCalledTimes(6);
  expect(github.readme).toHaveBeenCalledTimes(5);
  expect(createSnapshot).not.toHaveBeenCalled();
  expect(limitRequest).toHaveBeenCalledTimes(6);
  finish.resolve(input().profileReadme);
  const results = await Promise.all(calls);
  expect(results.every(result => result.status === "success")).toBe(true);
  expect(limitAnalysis).toHaveBeenCalledTimes(5);
  expect(createSnapshot).toHaveBeenCalledTimes(5);
  expect(state.permits.size).toBe(0);
  expect(await analyze(selection)).toMatchObject({status: "success"});
});

it.each(["network", "configuration"] as const)("releases capacity after a %s upstream failure", async code => {
  github.profile.mockRejectedValueOnce(new GitHubError(code));
  expect(await analyze(selection)).toEqual({status: "error", code});
  expect(state.permits.size).toBe(0);
  expect(await analyze(selection)).toMatchObject({status: "success"});
});

it.each(["configuration", "unavailable"] as const)("distinguishes capacity %s failure from a full pool", async code => {
  vi.mocked(acquireAnalysisCapacity).mockRejectedValue(new StorageError(code));
  expect(await analyze(selection)).toEqual({status: "error", code});
  expect(github.profile).toHaveBeenCalledTimes(1);
});

it("does not acquire capacity for invalid input, but still consumes its own entry quota", async () => {
  expect(await analyze({...selection, permit: "client-claimed"})).toMatchObject({code: "invalid_input"});
  expect(limitRequest).toHaveBeenCalledWith("analysis");
  expect(acquireAnalysisCapacity).not.toHaveBeenCalled();
});

it("prevents an overdue owner from writing after another operation reclaims capacity", async () => {
  const entered = Promise.withResolvers<void>(), oldResult = Promise.withResolvers<ReturnType<typeof input>["profile"]>();
  github.profile.mockImplementationOnce(() => {entered.resolve(); return oldResult.promise;});
  const old = analyze(selection); await entered.promise;
  vi.advanceTimersByTime(45001);
  expect(await analyze({...selection, repos: [{id: 11, name: "project-11"}]})).toMatchObject({status: "success"});
  oldResult.resolve(input().profile);
  expect(await old).toEqual({status: "error", code: "analysisExpired"});
  expect(createSnapshot).toHaveBeenCalledTimes(1);
  expect(state.permits.size).toBe(0);
});

it("preserves a saved result if owner-specific capacity cleanup fails and logs no credentials", async () => {
  const log = vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.mocked(releaseAnalysisCapacity).mockRejectedValue(new Error("private URI"));
  expect(await analyze(selection)).toMatchObject({status: "success", snapshot: {status: "saved"}});
  expect(log).toHaveBeenCalledWith("analysis_capacity_release_failed", expect.objectContaining({errorType: "unavailable"}));
  expect(JSON.stringify(log.mock.calls)).not.toMatch(/private URI|synthetic-access|00000000/);
});
