import {defineConfig} from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  timeout: 180_000,
  expect: {timeout: 15_000},
  use: {baseURL: "https://127.0.0.1:3197", ignoreHTTPSErrors: true,
    channel: process.env.PLAYWRIGHT_CHANNEL, trace: "off"},
  webServer: {command: "bash tests/e2e/server.sh", url: "https://127.0.0.1:3197",
    ignoreHTTPSErrors: true, reuseExistingServer: false, timeout: 120_000,
    gracefulShutdown: {signal: "SIGTERM", timeout: 10_000}},
});
