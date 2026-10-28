import {describe, expect, it} from "vitest";
import {normalizeProfile} from "../../src/lib/github/input";

describe("profile input", () => {
  it.each([" Mona-Cat ", "github.com/Mona-Cat", "https://github.com/Mona-Cat/"])(
    "normalizes %s", input => expect(normalizeProfile(input)).toBe("mona-cat"),
  );
  it.each([
    "", "@mona", "a_b", "a--b", "-mona", "mona-", "a".repeat(40),
    "https://evil.com/mona", "https://github.com.evil.com/mona",
    "https://token@github.com/mona", "https://github.com:443/mona",
    "https://github.com/mona/repo", "github.com/mona?tab=repositories", "github.com/mona#bio",
    "https://github.com/other/../mona", "https://github.com/%6dona", "http://github.com/mona",
    "github.com//mona", "https://github.com/mona\\repo", "a\nb", null, 123,
  ])("rejects unsupported input %s", input => expect(() => normalizeProfile(input)).toThrow());
  it("accepts the shortest and longest supported names", () => {
    expect(normalizeProfile("a")).toBe("a");
    expect(normalizeProfile("a".repeat(39))).toHaveLength(39);
  });
});
