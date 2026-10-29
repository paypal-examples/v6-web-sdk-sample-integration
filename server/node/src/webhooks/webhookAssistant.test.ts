import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import express, { type Express } from "express";

import { webhookRouter } from "./webhookRouter";

// eslint-disable-next-line unicorn/prefer-module
const CLIENT_DIRECTORY = path.join(__dirname, "../../../../client");
const PAGE_FOLDER =
  "/client/components/paypalPayments/oneTimePayment/html/src/recommended/";
const PAGE = `${PAGE_FOLDER}index.html`;
const INBOX_TAG = "<paypal-webhook-assistant";
const INBOX_TAGS = `<script type="module" src="/client/shared/webhook-assistant.js"></script>
<paypal-webhook-assistant endpoint="/paypal-api/webhooks/events"></paypal-webhook-assistant>
`;

function pageOnDisk(page: string): string {
  return readFileSync(
    path.join(CLIENT_DIRECTORY, page.replace(/^\/client/, "")),
    "utf8",
  );
}

describe("webhook inbox on sample pages", () => {
  let app: Express;

  beforeEach(() => {
    vi.stubEnv("PAYPAL_DEV", "1");

    // the same order as server.ts
    app = express();
    app.use(webhookRouter);
    app.use("/client", express.static(CLIENT_DIRECTORY));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("adds the inbox before </body> and keeps the rest of the page", async () => {
    const response = await request(app).get(PAGE);

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/^text\/html/);
    const page = pageOnDisk(PAGE);
    const bodyEnd = page.lastIndexOf("</body>");
    expect(response.text).toBe(
      page.slice(0, bodyEnd) + INBOX_TAGS + page.slice(bodyEnd),
    );
  });

  test("never reads a page outside the client folder", async () => {
    const response = await request(app).get(
      "/client/..%2F..%2Fclient/index.html",
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.text).not.toContain(INBOX_TAG);
  });

  test("serves pages unchanged outside dev mode", async () => {
    vi.stubEnv("PAYPAL_DEV", "");

    const response = await request(app).get(PAGE);

    expect(response.status).toBe(200);
    expect(response.text).toBe(pageOnDisk(PAGE));
  });
});
