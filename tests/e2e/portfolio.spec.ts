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
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("link",{name:tr.Card.download}).click();
  const file = info.outputPath("progress.png");
  await (await downloadEvent).saveAs(file);
  const png = await readFile(file);
  expect(png.subarray(0,8).toString("hex")).toBe("89504e470d0a1a0a");
  expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([1080,1920]);

  await page.locator("#share-report > summary").click();
  await page.getByLabel(tr.Sharing.consent).check();
  await button(tr.Sharing.create).click();
  const publicLink = page.getByRole("link",{name:tr.Sharing.openPublic});
  await expect(publicLink).toBeVisible();
  const anonymous = await browser.newContext({ignoreHTTPSErrors:true});
  try {
    const visitor = await anonymous.newPage();
    await visitor.goto(new URL((await publicLink.getAttribute("href"))!,page.url()).href);
    await expect(visitor.locator(".share-repos")).toContainText("atlas");
    await page.getByRole("link",{name:tr.Sharing.manage,exact:true}).click();
    await button(tr.Sharing.close).click();
    await expect(page.getByRole("status")).toContainText(tr.Sharing.closed);
    await visitor.reload();
    await expect(visitor.getByText(tr.Sharing.errors.missing)).toBeVisible();
    await button(tr.Sharing.delete).click();
    await expect(page.getByRole("status")).toContainText(tr.Sharing.deleted);
    await visitor.reload();
    await expect(visitor.getByText(tr.Sharing.errors.missing)).toBeVisible();
    await page.goto(fresh);
    await expect(page.locator(".report-meta")).toContainText(tr.Report.sources.fresh);
  } finally {await anonymous.close();}
});
