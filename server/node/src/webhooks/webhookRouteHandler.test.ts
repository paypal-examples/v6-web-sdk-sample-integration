import { createHmac, randomUUID } from "node:crypto";
import { crc32 } from "node:zlib";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import express, { type Express } from "express";

import { webhookRouter } from "./webhookRouter";

const WEBHOOK_ID = "WH-123456789";
const DEV_WEBHOOK_SECRET = "dGVzdC1kZXYtc2VjcmV0LXRleHQ";

// Builds the request exactly as `paypal webhook trigger --mode local` /
// `paypal webhook listen --forward-to` send it. supertest/superagent
// JSON.stringifies a Buffer passed to `.send()` rather than writing it raw, so
// we send the JSON string itself and sign over the exact same string, which is
// what the route's express.raw() hands the handler.
function cliSignedPayload(body: Record<string, unknown>) {
  const json = JSON.stringify(body);
  const transmissionId = randomUUID();
  const transmissionTime = new Date().toISOString();
  const canonical = `${transmissionId}|${transmissionTime}|PAYPALCLIDEVWEBHOOKV1|${crc32(Buffer.from(json, "utf8"))}`;
  const signature = `v1=${createHmac("sha256", Buffer.from(DEV_WEBHOOK_SECRET, "utf8")).update(canonical).digest("base64")}`;

  return {
    json,
    headers: {
      "Content-Type": "application/json",
      "paypal-cli-simulated": "true",
      "paypal-transmission-id": transmissionId,
      "paypal-transmission-time": transmissionTime,
      "paypal-cli-webhook-signature": signature,
    },
  };
}

describe("webhookRouteHandler", () => {
  let app: Express;

  beforeEach(() => {
    // The variables `paypal dev` injects into the app it launches.
    vi.stubEnv("PAYPAL_WEBHOOK_ID", WEBHOOK_ID);
    vi.stubEnv("PAYPAL_DEV_WEBHOOK_SECRET", DEV_WEBHOOK_SECRET);
    vi.stubEnv("PAYPAL_DEV", "1");

    // Same order as server.ts: the webhook router before the app-wide parser.
    app = express();
    app.use(webhookRouter);
    app.use(express.json());
    app.post("/echo", (request_, response_) => {
      response_.json(request_.body);
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("acknowledges a CLI-signed delivery with 200", async () => {
    const { json, headers } = cliSignedPayload({
      id: "evt-1",
      event_type: "PAYMENT.CAPTURE.COMPLETED",
    });

    const response = await request(app)
      .post("/paypal-api/webhooks/events")
      .set(headers)
      .send(json);

    expect(response.status).toBe(200);
  });

  test("acknowledges a CLI-signed delivery when `paypal dev` injected no PAYPAL_WEBHOOK_ID", async () => {
    vi.stubEnv("PAYPAL_WEBHOOK_ID", "");
    const { json, headers } = cliSignedPayload({
      id: "evt-no-webhook-id",
      event_type: "PAYMENT.CAPTURE.COMPLETED",
    });

    const response = await request(app)
      .post("/paypal-api/webhooks/events")
      .set(headers)
      .send(json);

    expect(response.status).toBe(200);
  });

  test("rejects an unsigned event with 401", async () => {
    const response = await request(app)
      .post("/paypal-api/webhooks/events")
      .send({ id: "evt-1", event_type: "PAYMENT.CAPTURE.COMPLETED" });

    expect(response.status).toBe(401);
  });

  test("ignores a CLI dev signature when PAYPAL_DEV is not set", async () => {
    vi.stubEnv("PAYPAL_DEV", "");
    const { json, headers } = cliSignedPayload({
      id: "evt-1",
      event_type: "PAYMENT.CAPTURE.COMPLETED",
    });

    const response = await request(app)
      .post("/paypal-api/webhooks/events")
      .set(headers)
      .send(json);

    expect(response.status).toBe(401);
  });

  test("still acknowledges a duplicate event ID with 200 without reprocessing", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { json, headers } = cliSignedPayload({
      id: "evt-dup",
      event_type: "PAYMENT.CAPTURE.COMPLETED",
    });

    for (let index = 0; index < 2; index++) {
      const response = await request(app)
        .post("/paypal-api/webhooks/events")
        .set(headers)
        .send(json);
      expect(response.status).toBe(200);
    }

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    consoleSpy.mockRestore();
  });

  test.each([
    ["neither PAYPAL_WEBHOOK_ID nor dev mode is set", {}],
    [
      "PAYPAL_DEV=1 is set but NODE_ENV is production",
      { PAYPAL_DEV: "1", NODE_ENV: "production" },
    ],
  ])(
    "responds with Express's usual 404, as if the route didn't exist, when %s",
    async (_label, environment) => {
      vi.stubEnv("PAYPAL_WEBHOOK_ID", "");
      vi.stubEnv("PAYPAL_DEV", "");
      for (const [name, value] of Object.entries(environment)) {
        vi.stubEnv(name, value);
      }

      const response = await request(app)
        .post("/paypal-api/webhooks/events")
        .send({ id: "evt-1", event_type: "PAYMENT.CAPTURE.COMPLETED" });

      expect(response.status).toBe(404);
      expect(response.text).toContain(
        "Cannot POST /paypal-api/webhooks/events",
      );
    },
  );

  test("rejects a non-JSON request with 415 before verifying", async () => {
    const response = await request(app)
      .post("/paypal-api/webhooks/events")
      .set("Content-Type", "text/plain")
      .send("not json");

    expect(response.status).toBe(415);
  });

  test("leaves the app-wide express.json() parsing other routes as before", async () => {
    const response = await request(app).post("/echo").send({ hello: "world" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ hello: "world" });
  });
});
