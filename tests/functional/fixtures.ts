/**
 * Shared Playwright fixtures for LPM functional tests.
 *
 * Logs only the 4 key LPM API calls to the terminal:
 *   1. POST find-eligible-methods
 *   2. POST create-order-for-one-time-payment
 *   3. POST confirm-payment-source  (fired by the PayPal SDK internally)
 *   4. GET  /paypal-api/checkout/orders/:id
 */

import { test as base, expect } from "@playwright/test";

// ─── URL patterns to watch ────────────────────────────────────────────────────

const WATCHED = [
  "find-eligible-methods",
  "create-order-for-one-time-payment",
  "confirm-payment-source",
  /\/paypal-api\/checkout\/orders\/[^/]+$/,   // GET /orders/:id (no trailing path)
] as const satisfies Array<string | RegExp>;

function isWatched(url: string): boolean {
  return WATCHED.some((pattern) =>
    typeof pattern === "string" ? url.includes(pattern) : pattern.test(url),
  );
}

// ─── ANSI colours ─────────────────────────────────────────────────────────────

const C = {
  reset: "\x1b[0m",
  dim:   "\x1b[2m",
  bold:  "\x1b[1m",
  green: "\x1b[32m",
  yellow:"\x1b[33m",
  red:   "\x1b[31m",
  cyan:  "\x1b[36m",
  blue:  "\x1b[34m",
};

function statusColor(s: number) {
  return s >= 500 ? C.red : s >= 400 ? C.yellow : C.green;
}

function shortPath(url: string): string {
  try { return new URL(url).pathname; } catch { return url; }
}

// ─── Fixture ──────────────────────────────────────────────────────────────────

export const test = base.extend<{ networkPage: typeof base.prototype.page }>({
  networkPage: async ({ page }, use, testInfo) => {
    console.log(`\n${C.blue}${C.bold}▶ ${testInfo.title}${C.reset}`);

    const pending = new Map<string, { method: string; start: number }>();

    page.on("request", (req) => {
      if (!isWatched(req.url())) return;
      pending.set(req.url(), { method: req.method(), start: Date.now() });
    });

    page.on("response", async (res) => {
      if (!isWatched(res.url())) return;
      const info = pending.get(res.url());
      const elapsed = info ? Date.now() - info.start : 0;
      const method  = info?.method ?? res.request().method();
      const status  = res.status();
      const sc      = statusColor(status);

      let body = "";
      try { body = await res.text(); } catch { /* ignore */ }

      // Pretty-print JSON, otherwise truncate
      let preview = body;
      try {
        const obj = JSON.parse(body);
        preview = JSON.stringify(obj, null, 2);
      } catch { /* keep raw */ }

      console.log(
        `\n${C.cyan}${method}${C.reset} ${shortPath(res.url())}` +
        `  ${sc}${status}${C.reset}  ${C.dim}${elapsed}ms${C.reset}\n` +
        preview.slice(0, 600) + (preview.length > 600 ? `\n${C.dim}…truncated${C.reset}` : ""),
      );
    });

    await use(page);
  },
});

export { expect };
