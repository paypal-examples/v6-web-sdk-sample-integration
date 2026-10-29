import type { Request, Response } from "express";

import { recordInboxEvent } from "./inboxEvents";
import type { WebhookEvent } from "./types";
import { verifyPayPalWebhook } from "./verifyPayPalWebhook";

// in memory, which is enough for a local dev process; a production handler
// would store processed event IDs durably
const processedEventIds = new Set<string>();

export async function webhookRouteHandler(
  request: Request,
  response: Response,
) {
  const eventFidelity = await verifyPayPalWebhook(
    request.headers,
    request.body,
  );

  if (!eventFidelity) {
    response
      .status(401)
      .json({ error: "Webhook signature verification failed" });
    return;
  }

  const event = parseWebhookEvent(request.body);
  if (!event) {
    response
      .status(400)
      .json({ error: "Webhook body must be a webhook event in JSON" });
    return;
  }

  // acknowledge every verified event, duplicates included, since PayPal
  // retries anything other than a prompt 2xx
  response.sendStatus(200);

  // the inbox keeps its own list, so a redelivery shows again after Clear all
  recordInboxEvent(event);

  if (recordEvent(event.id)) {
    console.log(
      `Received verified webhook event (${eventFidelity}): ${event.event_type} [${event.id}]`,
    );
  }
}

function parseWebhookEvent(body: Buffer): WebhookEvent | undefined {
  try {
    const event = JSON.parse(body.toString("utf8"));
    return typeof event?.id === "string" &&
      typeof event?.event_type === "string"
      ? event
      : undefined;
  } catch {
    return undefined;
  }
}

// records the event ID, and returns false if it was already processed
function recordEvent(eventId: string): boolean {
  if (processedEventIds.has(eventId)) {
    return false;
  }
  processedEventIds.add(eventId);
  return true;
}
