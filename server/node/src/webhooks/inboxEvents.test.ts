import { createHmac, randomUUID } from "node:crypto";
import { crc32 } from "node:zlib";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import express, { type Express } from "express";

import { recordInboxEvent } from "./inboxEvents";
import { webhookRouter } from "./webhookRouter";

const DEV_WEBHOOK_SECRET = "dGVzdC1kZXYtc2VjcmV0LXRleHQ";

// signs a delivery the way `paypal webhook listen --forward-to` does; see
// webhookRouteHandler.test.ts
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

function webhookEvent(eventType = "PAYMENT.CAPTURE.COMPLETED") {
  return {
    id: `evt-${randomUUID()}`,
    event_type: eventType,
    resource: { id: "CAPTURE-1", status: "COMPLETED" },
  };
}

describe("inbox event routes", () => {
  let app: Express;

  beforeEach(() => {
    vi.stubEnv("PAYPAL_DEV_WEBHOOK_SECRET", DEV_WEBHOOK_SECRET);
    vi.stubEnv("PAYPAL_DEV", "1");
    vi.spyOn(console, "log").mockImplementation(() => {});

    app = express();
    app.use(webhookRouter);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  async function deliver(body: Record<string, unknown>) {
    const { json, headers } = cliSignedPayload(body);
    await request(app)
      .post("/paypal-api/webhooks/events")
      .set(headers)
      .send(json);
  }

  async function listEntries() {
    const response = await request(app).get("/paypal-api/webhooks/events");
    return response.body.entries as { id: string }[];
  }

  async function listEntryIds() {
    const entries = await listEntries();
    return entries.map(({ id }) => id);
  }

  test("lists verified events newest first, with friendly names and the server time", async () => {
    const approval = webhookEvent("CHECKOUT.ORDER.APPROVED");
    const capture = webhookEvent("PAYMENT.CAPTURE.COMPLETED");
    await deliver(approval);
    await deliver(capture);

    const response = await request(app).get("/paypal-api/webhooks/events");

    expect(response.status).toBe(200);
    expect(response.body.entries.slice(0, 2)).toEqual([
      {
        id: capture.id,
        type: "PAYMENT.CAPTURE.COMPLETED",
        receivedAt: expect.any(String),
        payload: capture,
      },
      expect.objectContaining({ id: approval.id, payload: approval }),
    ]);
    expect(response.body.names).toMatchObject({
      "PAYMENT.CAPTURE.COMPLETED": "Payment captured",
    });
    expect(Number.isNaN(Date.parse(response.body.now))).toBe(false);
  });

  test("masks personal values in stored payloads", async () => {
    const event = {
      ...webhookEvent("CHECKOUT.ORDER.APPROVED"),
      resource: {
        id: "ORDER-1",
        payer: {
          email_address: "buyer@example.com",
          name: { given_name: "Jane", surname: "Doe" },
        },
      },
    };
    await deliver(event);

    const response = await request(app).get("/paypal-api/webhooks/events");
    const { resource } = response.body.entries[0].payload;

    expect(resource.id).toBe("ORDER-1");
    expect(resource.payer).toEqual({
      email_address: "b***@example.com",
      name: { given_name: "J***", surname: "D***" },
    });
  });

  test("keeps only the 25 most recent events", async () => {
    const events = Array.from({ length: 26 }, () => webhookEvent());
    for (const event of events) {
      await deliver(event);
    }

    const listedIds = await listEntryIds();

    expect(listedIds).toHaveLength(25);
    expect(listedIds[0]).toBe(events[25].id);
    expect(listedIds).not.toContain(events[0].id);
  });

  test("lists a duplicate delivery once", async () => {
    const event = webhookEvent();
    await deliver(event);
    await deliver(event);

    const listedIds = await listEntryIds();

    expect(listedIds.filter((id) => id === event.id)).toHaveLength(1);
  });

  test("lists a redelivery again after Clear all removed it", async () => {
    const event = webhookEvent();
    await deliver(event);
    await request(app).delete(
      `/paypal-api/webhooks/events?through=${event.id}`,
    );

    await deliver(event);
    const listedIds = await listEntryIds();

    expect(listedIds.filter((id) => id === event.id)).toHaveLength(1);
  });

  test("doesn't list an event that failed verification", async () => {
    const event = webhookEvent();
    await request(app).post("/paypal-api/webhooks/events").send(event);

    expect(await listEntries()).not.toContainEqual(
      expect.objectContaining({ id: event.id }),
    );
  });

  test("Clear all removes the given event and every older one", async () => {
    const older = webhookEvent();
    const newest = webhookEvent();
    await deliver(older);
    await deliver(newest);

    const response = await request(app).delete(
      `/paypal-api/webhooks/events?through=${newest.id}`,
    );
    const newer = webhookEvent();
    await deliver(newer);

    expect(response.status).toBe(204);
    expect(await listEntryIds()).toEqual([newer.id]);
  });

  test("Clear all needs the newest event to clear", async () => {
    const response = await request(app).delete("/paypal-api/webhooks/events");

    expect(response.status).toBe(400);
  });

  test("serves the shared inbox script", async () => {
    const response = await request(app).get(
      "/paypal-api/webhooks/webhook-assistant.js",
    );

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/^text\/javascript/);
    expect(response.text).toContain("paypal-webhook-assistant");
  });

  describe.each([
    ["outside dev mode, even with a webhook ID set", { PAYPAL_DEV: "" }],
    ["in production, even with PAYPAL_DEV set", { NODE_ENV: "production" }],
  ])("%s", (_label, environment) => {
    beforeEach(() => {
      vi.stubEnv("PAYPAL_WEBHOOK_ID", "WH-123456789");
      for (const [name, value] of Object.entries(environment)) {
        vi.stubEnv(name, value);
      }
    });

    test.each([
      ["GET", "/paypal-api/webhooks/events"],
      ["DELETE", "/paypal-api/webhooks/events?through=evt-1"],
      ["GET", "/paypal-api/webhooks/webhook-assistant.js"],
    ])("responds to %s %s with 404", async (method, path) => {
      const response =
        method === "GET"
          ? await request(app).get(path)
          : await request(app).delete(path);

      expect(response.status).toBe(404);
    });

    test("doesn't record events", async () => {
      const event = webhookEvent();
      recordInboxEvent(event);

      // turn dev mode back on, so the list can be read
      vi.stubEnv("PAYPAL_DEV", "1");
      vi.stubEnv("NODE_ENV", "test");

      expect(await listEntryIds()).not.toContain(event.id);
    });
  });
});
