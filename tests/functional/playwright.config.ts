import { defineConfig, devices } from "@playwright/test";

/**
 * Functional tests for the LPM React wrapper demo
 *
 * Prerequisites:
 *   1. React dev server running: cd client/prebuiltPages/react && npm start
 *      (or Express server: cd server/node && npm start  — serves react at /react-demo/)
 *   2. .env at repo root with valid PAYPAL_SANDBOX_CLIENT_ID + PAYPAL_SANDBOX_CLIENT_SECRET
 *
 * Run:
 *   cd tests/functional && npm install && npx playwright test
 *   npx playwright test --headed          # show browser (maximised)
 *   npx playwright test --debug           # step-through debugger
 */
export default defineConfig({
  testDir: "./lpm",
  timeout: 120_000, // PayPal popup can be slow on sandbox

  expect: {
    timeout: 30_000,
  },

  // Re-run flaky tests once automatically
  retries: 1,

  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],

  use: {
    // React dev server
    baseURL: "http://localhost:3000",

    // Capture evidence on failure
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",

    // PayPal popup windows need permission
    browserName: "chromium",

    // Always launch maximised so the browser fills the screen.
    // A large fixed viewport keeps deviceScaleFactor compatible while still
    // making the page fill most monitors.
    launchOptions: {
      args: [
        "--start-maximized",
        // Automatically open Chrome DevTools for every new tab.
        // After the first run, Chrome remembers the last active panel (Network).
        "--auto-open-devtools-for-tabs",
      ],
    },
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Wide viewport so the maximised window is fully utilised.
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
});
