import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import express from "express";

import { recordInboxEvent } from "./inboxEvents";
import { webhookRouter } from "./webhookRouter";

const app = express().use(webhookRouter);

function webhookEvent(eventType = "PAYMENT.CAPTURE.COMPLETED") {
  return { id: `evt-${randomUUID()}`, event_type: eventType };
}

async function listedIds() {
  const response = await request(app).get("/paypal-api/webhooks/events");
  return response.body.entries.map(({ id }: { id: string }) => id);
}

function clearThrough(id: string) {
  return request(app).delete(`/paypal-api/webhooks/events?through=${id}`);
}

describe("inbox event routes", () => {
  beforeEach(() => {
    vi.stubEnv("PAYPAL_DEV", "1");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("lists events newest first, once each, with friendly names", async () => {
    const approval = webhookEvent("CHECKOUT.ORDER.APPROVED");
    const capture = webhookEvent("PAYMENT.CAPTURE.COMPLETED");
    recordInboxEvent(approval);
    recordInboxEvent(capture);
    recordInboxEvent(capture);

    const response = await request(app).get("/paypal-api/webhooks/events");

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
  });

  test("keeps only the 25 most recent events", async () => {
    const events = Array.from({ length: 26 }, () => webhookEvent());
    for (const event of events) {
      recordInboxEvent(event);
    }

    const ids = await listedIds();

    expect(ids).toHaveLength(25);
    expect(ids[0]).toBe(events[25].id);
    expect(ids).not.toContain(events[0].id);
  });

  test("Clear all removes the given event and every older one, and a redelivery shows again", async () => {
    const older = webhookEvent();
    const newest = webhookEvent();
    recordInboxEvent(older);
    recordInboxEvent(newest);

    const response = await clearThrough(newest.id);
    const newer = webhookEvent();
    recordInboxEvent(newer);
    recordInboxEvent(newest);

    expect(response.status).toBe(204);
    expect(await listedIds()).toEqual([newest.id, newer.id]);
  });

  test("is off outside dev mode, even with a webhook ID set", async () => {
    vi.stubEnv("PAYPAL_WEBHOOK_ID", "WH-123456789");
    vi.stubEnv("PAYPAL_DEV", "");
    const event = webhookEvent();
    recordInboxEvent(event);

    const list = await request(app).get("/paypal-api/webhooks/events");
    const clear = await clearThrough("evt-1");

    expect(list.status).toBe(404);
    expect(clear.status).toBe(404);

    vi.stubEnv("PAYPAL_DEV", "1");
    expect(await listedIds()).not.toContain(event.id);
  });
});
