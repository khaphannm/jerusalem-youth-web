import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./checks/homepage",
  workers: 1,
  use: { baseURL: "http://localhost:3100", ...devices["Desktop Chrome"] },
  webServer: [
    {
      command: "node checks/homepage/cms.mjs",
      url: "http://127.0.0.1:1439/api/site-setting",
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --webpack --port 3100",
      url: "http://localhost:3100",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        CMS_BASE_URL: "http://127.0.0.1:1439",
        SITE_URL: "http://localhost:3100",
        CMS_REVALIDATION_SECRET:
          "homepage-browser-fixture-secret-at-least-32-characters",
      },
    },
  ],
});
