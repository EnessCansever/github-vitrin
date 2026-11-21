import {readFile} from "node:fs/promises";
import {setTimeout as delay} from "node:timers/promises";
import {expect, test} from "@playwright/test";
import tr from "../../src/messages/tr.json";

test("private analysis, cache, refresh, comparison PNG and revocable public share", async ({page, browser}, info) => {
  const button = (name: string) => page.getByRole("button", {name, exact:true});
  async function analyze() {
    await page.goto("/");
    await page.locator("#github-profile").fill("fixture-dev");
    await button(tr.Search.submit).click();
    const beacon = page.getByRole("checkbox", {name:/beacon/});
    await expect(beacon).toBeChecked();
    await beacon.uncheck();
    await button(tr.Select.analyze).click();
    await expect(page.locator(".live-report")).toBeVisible();
  }

  await analyze();
  await expect(page.locator(".report-meta")).toContainText(tr.Report.sources.fresh);
  const session = (await page.context().cookies()).find(cookie => cookie.name === "__Host-rv-session");
  expect(session?.httpOnly && session.secure && session.expires === -1).toBe(true);
  const fresh = page.url(), measured = Date.now();
  await page.reload();
  await expect(page.locator(".report-meta")).toContainText(tr.Report.sources.fresh);
  await analyze();
  await expect(page.locator(".report-meta")).toContainText(tr.Report.sources.cache);
  expect(page.url() !== fresh).toBe(true);
  const compare = page.locator("#compare-reports");
  await compare.locator("summary").first().click();
  await button(tr.Comparison.compare).click();
  await expect(compare).toContainText(tr.Comparison.blocked.same);

  // Exercise the real cooldown without changing the server clock or production policy.
  await delay(Math.max(0, measured + 60_000 - Date.now()));
  await button(tr.SavedReport.refresh).click();
  await expect(page.locator(".report-meta")).toContainText(tr.Report.sources.refresh);
  await compare.locator("summary").first().click();
  await button(tr.Comparison.compare).click();
  await expect(compare.locator(".comparison-delta")).toContainText("+10");
  await button(tr.Card.progress).click();
  for (const [format, width, height] of [
    ["story", 1080, 1920], ["post", 1080, 1350], ["landscape", 1200, 630],
  ] as const) {
    await page.getByRole("radio", {name: tr.Card[format], exact:true}).check();
    const downloadEvent = page.waitForEvent("download");
    await page.getByRole("link", {name:tr.Card.download}).click();
    const file = info.outputPath(format + ".png");
    await (await downloadEvent).saveAs(file);
    const png = await readFile(file);
    expect(png.subarray(0,8).toString("hex")).toBe("89504e470d0a1a0a");
    const size = await page.evaluate(async base64 => {
      const img = new Image();
      img.src = "data:image/png;base64," + base64;
      await img.decode();
      return [img.naturalWidth, img.naturalHeight];
    }, png.toString("base64"));
    expect(size).toEqual([width, height]);
  }

  const refreshed = page.url();
  const anonymous = await browser.newContext({ignoreHTTPSErrors:true, viewport:{width:390,height:844}});
  try {
    const visitor = await anonymous.newPage();
    const ids = new Set<string>();
    for (const [action, report] of [["close", refreshed], ["delete", fresh]] as const) {
      await page.goto(report);
      await page.locator("#share-report > summary").click();
      await page.getByLabel(tr.Sharing.consent).check();
      await button(tr.Sharing.create).click();
      const link = page.getByRole("link",{name:tr.Sharing.openPublic});
      await expect(link).toBeVisible();
      const url = new URL((await link.getAttribute("href"))!,page.url());
      expect(url.origin === new URL(report).origin && !ids.has(url.pathname)).toBe(true);
      ids.add(url.pathname);
      await visitor.goto(url.href);
      await expect(visitor.locator(".share-repos")).toContainText("atlas");
      for (const locale of ["en", "tr"]) {
        await visitor.getByRole("button",{name:locale.toUpperCase(),exact:true}).click();
        await expect(visitor.locator("main")).toHaveAttribute("lang",locale);
        expect(await visitor.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      const meta = visitor.locator('meta[property="og:image"]');
      await expect(meta).toHaveAttribute("content", /\/image\/tr$/);
      const image = (await meta.getAttribute("content"))!;
      expect(new URL(image).origin === url.origin).toBe(true);
      const active = await visitor.request.get(image);
      expect(active.status()).toBe(200);
      expect(active.headers()["content-type"]).toBe("image/png");
      expect(active.headers()["cache-control"]).toContain("no-store");
      await page.getByRole("link",{name:tr.Sharing.manage,exact:true}).click();
      await button(tr.Sharing[action]).click();
      await expect(page.getByRole("status")).toContainText(tr.Sharing[action === "close" ? "closed" : "deleted"]);
      const response = await visitor.goto(url.href);
      await expect(visitor.getByText(tr.Sharing.errors.missing)).toBeVisible();
      expect((await response!.text()).includes("fixture-dev")).toBe(false);
      await expect(visitor.locator('meta[property="og:image"], meta[name="twitter:image"]')).toHaveCount(0);
      const revoked = await visitor.request.get(image);
      expect(revoked.status()).toBe(404);
      expect(await revoked.json()).toEqual({code:"missing"});
      expect(revoked.headers()["cache-control"]).toContain("no-store");
    }
    await page.goto(fresh);
    await expect(page.locator(".report-meta")).toContainText(tr.Report.sources.fresh);
  } finally {await anonymous.close();}
});
