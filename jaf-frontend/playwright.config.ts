import { defineConfig, devices } from "@playwright/test";

const stubPort = 9999;
const baseURL = "http://127.0.0.1:3000";
const stubUrl = `http://127.0.0.1:${stubPort}/`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: `node e2e/stub-backend.mjs`,
      url: stubUrl,
      reuseExistingServer: !process.env.CI,
      env: { ...process.env, STUB_CHAT_PORT: String(stubPort) },
    },
    {
      // Dev server so NEXT_PUBLIC_* vars are picked up at compile time (not baked into a prior build).
      command: "npm run dev -- --port 3000",
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        NEXT_PUBLIC_BACKEND_URL: `http://127.0.0.1:${stubPort}`,
        NEXT_PUBLIC_E2E: "true",
      },
    },
  ],
});
