import {afterEach, beforeEach, vi} from "vitest";

vi.mock("server-only", () => ({}));

beforeEach(() => {
  vi.stubEnv("GITHUB_TOKEN", "test_only_not_a_real_token");
  vi.stubGlobal("fetch", vi.fn(() => {
    throw new Error("Unmocked network request");
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
