import { defineConfig } from "@playwright/test";
const hosted = process.env.BIBLE_PREVIEW_URL;
export default defineConfig({
  testDir: "./e2e",
  testMatch: "*.e2e.ts",
  workers: 2,
  reporter: "list",
  use: {
    baseURL: hosted || "http://127.0.0.1:4177",
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : undefined,
  },
  webServer: hosted
    ? undefined
    : {
        command: "npm run preview -- --port 4177 --strictPort",
        url: "http://127.0.0.1:4177",
        reuseExistingServer: !process.env.CI,
      },
});
