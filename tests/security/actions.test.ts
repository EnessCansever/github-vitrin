import {beforeEach, expect, it, vi} from "vitest";
import {getRepos, analyze} from "../../src/features/analysis/actions";
import {loadReport} from "../../src/features/reports/actions";
import {generateCard} from "../../src/features/cards/actions";
import {consumeRateLimit} from "../../src/lib/db/rate-limits";
import {createSnapshot, readSnapshot} from "../../src/lib/db/snapshots";
import {renderCard} from "../../src/features/cards/image";
import {StorageError} from "../../src/lib/db/errors";
import {GitHubError} from "../../src/lib/github/errors";
import {requestLimits} from "../../src/config/request-limits";
import {reportSchema} from "../../src/lib/db/snapshot-schema";
import {report} from "../db/fixtures";
import {input} from "../scoring/fixtures";

vi.mock("../../src/lib/db/analysis-runs", () => ({failAnalysisRun: vi.fn(async () => {}), waitForAnalysis: vi.fn(async () => null)}));
vi.mock("../../src/lib/db/analysis-capacity", () => ({
  acquireAnalysisCapacity: vi.fn(async () => ({acquired: true, permit: {
    owner: "22222222-2222-4222-8222-222222222222", expiresAt: new Date(Date.now() + 45000).toISOString(),
  }})),
  ownsAnalysisCapacity: vi.fn(async () => true), releaseAnalysisCapacity: vi.fn(async () => true),
}));
vi.mock("../../src/lib/db/analysis-locks", async importOriginal => ({
  ...await importOriginal<typeof import("../../src/lib/db/analysis-locks")>(),
  acquireAnalysisLock: vi.fn(async (key: string) => ({acquired: true, lock: {
    key, owner: "11111111-1111-4111-8111-111111111111", expiresAt: new Date(Date.now() + 45000).toISOString(),
  }})),
  ownsAnalysisLock: vi.fn(async () => true), releaseAnalysisLock: vi.fn(async () => true),
}));
const github = vi.hoisted(() => ({profile: vi.fn(), pinned: vi.fn(), candidates: vi.fn(), selected: vi.fn(), repository: vi.fn(), repoReadme: vi.fn(), readme: vi.fn()}));
vi.mock("../../src/lib/github/client", () => ({GitHubClient: vi.fn(function () {
  return {getProfile: github.profile, getPinned: github.pinned, getCandidates: github.candidates,
    getSelected: github.selected, getRepository: github.repository, getReadme: github.repoReadme, getProfileReadme: github.readme};
})}));
vi.mock("next-intl/server", () => ({getLocale: async () => "tr"}));
vi.mock("../../src/lib/db/rate-limits", () => ({consumeRateLimit: vi.fn()}));
vi.mock("../../src/lib/db/snapshots", () => ({createSnapshot: vi.fn(), readSnapshot: vi.fn()}));
vi.mock("../../src/features/cards/image", () => ({renderCard: vi.fn()}));

const id = "11111111-1111-4111-8111-111111111111", token = "a".repeat(64);
const access = {id, token};
const selected = {username: "mira-sample", profileId: 1, repos: [{id: 10, name: "project-10"}]};
type Counter = {count: number; expiresAt: number};
let counters: Map<string, Counter>;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-01T00:00:00Z"));
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("SIGNING_SECRET", "synthetic-test-key-with-at-least-32-bytes");
  counters = new Map();
  vi.mocked(consumeRateLimit).mockReset().mockImplementation(async value => {
    const {key, limit, windowMs} = value as {key: string; limit: number; windowMs: number};
    let counter = counters.get(key);
    if (!counter || counter.expiresAt <= Date.now()) {
      counter = {count: 0, expiresAt: Date.now() + windowMs};
      counters.set(key, counter);
    }
    const resetAt = new Date(counter.expiresAt).toISOString();
    if (counter.count >= limit) return {allowed: false, remaining: 0, resetAt, retryAt: resetAt};
    counter.count++;
    return {allowed: true, remaining: limit - counter.count, resetAt, retryAt: null};
  });
  const value = input();
  github.profile.mockReset().mockResolvedValue(value.profile);
  github.pinned.mockReset().mockResolvedValue({status: "available", repos: []});
  github.candidates.mockReset().mockResolvedValue({repos: value.repos.map(item => item.repo), limited: false});
  github.selected.mockReset().mockResolvedValue(value.repos);
  github.repository.mockReset().mockResolvedValue(value.repos[0].repo);
  github.repoReadme.mockReset().mockResolvedValue(value.repos[0].readme);
  github.readme.mockReset().mockResolvedValue(value.profileReadme);
  vi.mocked(createSnapshot).mockReset().mockResolvedValue({id, readToken: token});
  vi.mocked(readSnapshot).mockReset().mockResolvedValue({id, snapshotVersion: 1, selectedRepoIds: [10], scopeHash: "b".repeat(64),
    createdAt: "2026-11-01T00:00:00Z", expiresAt: "2026-12-01T00:00:00Z", report: reportSchema.parse(report())});
  vi.mocked(renderCard).mockReset().mockResolvedValue(new ArrayBuffer(1));
});

it("charges invalid search attempts and stops GitHub at the approved limit, then reopens after expiry", async () => {
  for (let i = 0; i < requestLimits.search.limit; i++) expect(await getRepos(null)).toMatchObject({code: "invalid_input"});
  expect(await getRepos("mira-sample")).toEqual({status: "error", code: "rateLimit", retryAt: "2026-11-01T00:10:00.000Z"});
  expect(github.profile).not.toHaveBeenCalled();
  vi.advanceTimersByTime(600_000);
  expect(await getRepos("mira-sample")).toMatchObject({status: "success"});
  expect(github.profile).toHaveBeenCalledTimes(1);
});

it("separates search, analysis, report and image budgets without double-counting internal reads", async () => {
  for (let i = 0; i < 20; i++) await getRepos(null);
  expect(await analyze(selected)).toMatchObject({status: "success", snapshot: {status: "saved"}});
  const before = vi.mocked(consumeRateLimit).mock.calls.length;
  expect(await generateCard({...access, format: "story"})).toMatchObject({status: "success"});
  expect(consumeRateLimit).toHaveBeenCalledTimes(before + 1);
  expect(vi.mocked(consumeRateLimit).mock.calls.at(-1)?.[0]).toMatchObject(requestLimits.card);
  expect(await loadReport(access)).toMatchObject({status: "success"});
  expect(vi.mocked(consumeRateLimit).mock.calls.at(-1)?.[0]).toMatchObject(requestLimits.report);
});

it("shares Story/landscape quota and stops storage/render after the image budget is full", async () => {
  for (let i = 0; i < 10; i++) expect(await generateCard({...access, format: i % 2 ? "story" : "landscape"})).toMatchObject({status: "success"});
  expect(await generateCard({...access, format: "story"})).toEqual({status: "error", code: "rateLimit", retryAt: "2026-11-01T00:10:00.000Z"});
  expect(renderCard).toHaveBeenCalledTimes(10);
  expect(readSnapshot).toHaveBeenCalledTimes(10);
  expect(await loadReport(access)).toMatchObject({status: "success"});
});

it("charges wrong-token and malformed report accesses before reading storage", async () => {
  vi.mocked(readSnapshot).mockResolvedValue(null);
  for (let i = 0; i < 30; i++) {
    expect(await loadReport({...access, token: "b".repeat(64)})).toEqual({status: "missing"});
    expect(await loadReport({id, token: "wrong"})).toEqual({status: "missing"});
  }
  expect(await loadReport(access)).toEqual({status: "rateLimit", retryAt: "2026-11-01T00:01:00.000Z"});
  expect(readSnapshot).toHaveBeenCalledTimes(30);
  vi.advanceTimersByTime(60_000);
  expect(await loadReport(access)).toEqual({status: "missing"});
});

it("charges invalid card attempts and never renders missing or incomplete records", async () => {
  expect(await generateCard({...access, score: 100})).toMatchObject({code: "invalid"});
  expect(readSnapshot).not.toHaveBeenCalled();
  vi.mocked(readSnapshot).mockResolvedValueOnce(null);
  expect(await generateCard({...access, format: "story"})).toMatchObject({code: "missing"});
  const stored = await readSnapshot(id, token);
  vi.mocked(readSnapshot).mockResolvedValue({...stored!, report: reportSchema.parse(report(1, true))});
  expect(await generateCard({...access, format: "story"})).toMatchObject({code: "incomplete"});
  expect(consumeRateLimit).toHaveBeenCalledTimes(3);
  expect(renderCard).not.toHaveBeenCalled();
});

it("charges invalid analysis requests and blocks GitHub and snapshot writes at the IP limit", async () => {
  for (let i = 0; i < 10; i++) expect(await analyze({...selected, ip: "client-controlled"})).toMatchObject({code: "invalid_input"});
  expect(await analyze(selected)).toEqual({status: "error", code: "rateLimit", retryAt: "2026-11-01T00:10:00.000Z"});
  expect(github.profile).not.toHaveBeenCalled();
  expect(createSnapshot).not.toHaveBeenCalled();
  expect(consumeRateLimit).toHaveBeenCalledTimes(11);
});

it("enforces cooldown after metadata validation and before README or snapshot work", async () => {
  expect(await analyze(selected)).toMatchObject({status: "success"});
  expect(await analyze({...selected, username: "https://github.com/MIRA-SAMPLE/"})).toEqual({
    status: "error", code: "rateLimit", retryAt: "2026-11-01T00:01:00.000Z",
  });
  expect(github.profile).toHaveBeenCalledTimes(2);
  expect(github.repoReadme).toHaveBeenCalledTimes(1);
  expect(createSnapshot).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(60_000);
  expect(await analyze(selected)).toMatchObject({status: "success"});
  expect(github.profile).toHaveBeenCalledTimes(3);
  expect(createSnapshot).toHaveBeenCalledTimes(2);
});

it("charges an unverified preflight failure only to the IP entry budget", async () => {
  github.profile.mockRejectedValueOnce(new GitHubError("network"));
  expect(await analyze(selected)).toEqual({status: "error", code: "network"});
  expect(await analyze(selected)).toMatchObject({status: "success"});
  expect(github.profile).toHaveBeenCalledTimes(2);
  expect(createSnapshot).toHaveBeenCalledTimes(1);
});

it("keeps the 60-second wait after a verified analysis fails and releases its working lock", async () => {
  github.repoReadme.mockRejectedValueOnce(new GitHubError("network"));
  expect(await analyze(selected)).toEqual({status: "error", code: "network"});
  expect(await analyze(selected)).toEqual({status: "error", code: "rateLimit", retryAt: "2026-11-01T00:01:00.000Z"});
  expect(github.profile).toHaveBeenCalledTimes(2);
  expect(github.repoReadme).toHaveBeenCalledTimes(1);
  expect(createSnapshot).not.toHaveBeenCalled();
});

it("does not reset the profile cooldown when the IP key rotates at a time boundary", async () => {
  vi.setSystemTime(new Date("2026-11-01T00:09:59Z"));
  expect(await analyze(selected)).toMatchObject({status: "success"});
  vi.advanceTimersByTime(1000);
  expect(await analyze(selected)).toEqual({
    status: "error", code: "rateLimit", retryAt: "2026-11-01T00:10:59.000Z",
  });
  expect(github.profile).toHaveBeenCalledTimes(2);
  expect(createSnapshot).toHaveBeenCalledTimes(1);
});

it.each(["configuration", "unavailable"] as const)("does not disguise limiter %s errors or start expensive operations", async code => {
  vi.mocked(consumeRateLimit).mockRejectedValue(new StorageError(code));
  expect(await getRepos("mira-sample")).toEqual({status: "error", code});
  expect(await analyze(selected)).toEqual({status: "error", code});
  expect(await generateCard({...access, format: "story"})).toEqual({status: "error", code});
  expect(await loadReport(access)).toEqual({status: code});
  expect(github.profile).not.toHaveBeenCalled();
  expect(readSnapshot).not.toHaveBeenCalled();
  expect(renderCard).not.toHaveBeenCalled();
  expect(createSnapshot).not.toHaveBeenCalled();
});

it("rejects missing secret configuration before database/GitHub/render work", async () => {
  vi.stubEnv("SIGNING_SECRET", "");
  expect(await analyze(selected)).toEqual({status: "error", code: "configuration"});
  expect(consumeRateLimit).not.toHaveBeenCalled();
  expect(github.profile).not.toHaveBeenCalled();
});
