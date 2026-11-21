import {afterEach, expect, it, vi} from "vitest";
import {SkipLink} from "../../src/components/skip-link";

afterEach(() => vi.unstubAllGlobals());

it("moves keyboard focus to main without replacing a report or management fragment", () => {
  const main = {tabIndex: 0, focus: vi.fn(), scrollIntoView: vi.fn()};
  vi.stubGlobal("document", {getElementById: (id: string) => id === "main" ? main : null});
  const preventDefault = vi.fn();
  SkipLink({label: "İçeriğe geç"}).props.onClick({preventDefault});
  expect(preventDefault).toHaveBeenCalledOnce();
  expect(main.tabIndex).toBe(-1);
  expect(main.focus).toHaveBeenCalledOnce();
});
