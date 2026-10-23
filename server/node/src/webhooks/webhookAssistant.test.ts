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
const INBOX_TAGS = `<script type="module" src="/paypal-api/webhooks/webhook-assistant.js"></script>
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

  test("adds the inbox to a page requested by its folder", async () => {
    const response = await request(app).get(PAGE_FOLDER);

    expect(response.status).toBe(200);
    expect(response.text).toContain(INBOX_TAG);
  });

  test("adds the inbox to pages that don't come from paypal init too", async () => {
    const response = await request(app).get("/client/index.html");

    expect(response.text).toContain(INBOX_TAG);
  });

  test("serves files other than pages unchanged", async () => {
    const response = await request(app).get(`${PAGE_FOLDER}app.js`);

    expect(response.status).toBe(200);
    expect(response.text).toBe(pageOnDisk(`${PAGE_FOLDER}app.js`));
  });

  test.each([
    ["a missing page", "/client/missing/index.html"],
    ["a path outside the client folder", "/client/..%2F..%2Fclient/index.html"],
    ["a dotfile", "/client/.hidden.html"],
  ])("hands %s on to express.static", async (_label, page) => {
    const response = await request(app).get(page);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.text).not.toContain(INBOX_TAG);
  });

  test("leaves HEAD requests to express.static", async () => {
    const response = await request(app).head(PAGE);

    expect(response.status).toBe(200);
    // the page as it is on disk, without the inbox
    expect(Number(response.headers["content-length"])).toBe(
      Buffer.byteLength(pageOnDisk(PAGE)),
    );
  });

  test.each([
    ["outside dev mode", { PAYPAL_DEV: "" }],
    ["in production, even with PAYPAL_DEV set", { NODE_ENV: "production" }],
  ])("serves pages unchanged %s", async (_label, environment) => {
    for (const [name, value] of Object.entries(environment)) {
      vi.stubEnv(name, value);
    }

    const response = await request(app).get(PAGE);

    expect(response.status).toBe(200);
    expect(response.text).toBe(pageOnDisk(PAGE));
  });
});
