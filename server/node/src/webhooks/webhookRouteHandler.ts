import type { Request, Response } from "express";

import { MAX_TRACKED_EVENT_IDS } from "./constants";
import type { WebhookEvent } from "./types";
import { verifyPayPalWebhook } from "./verifyPayPalWebhook";

const processedEventIds = new Set<string>();

export async function webhookRouteHandler(
  request: Request,
  response: Response,
) {
  // express.raw() only reads application/json bodies; anything else arrives
  // without a body to verify
  if (!Buffer.isBuffer(request.body)) {
    response
      .status(415)
      .json({ error: "Webhook body must be application/json" });
    return;
  }

  const { verified, eventFidelity } = await verifyPayPalWebhook(
    request.headers,
    request.body,
  );

  if (!verified) {
    response
      .status(401)
      .json({ error: "Webhook signature verification failed" });
    return;
  }

  const event: WebhookEvent = JSON.parse(request.body.toString("utf8"));

  // acknowledge every verified event, duplicates included, since PayPal
  // retries anything other than a prompt 2xx
  response.status(200).json({ received: true, eventFidelity });

  if (recordEvent(event.id)) {
    console.log(
      `Received verified webhook event (${eventFidelity}): ${event.event_type} [${event.id}]`,
    );
  }
}

// records the event ID, and returns false if it was already processed
function recordEvent(eventId: string): boolean {
  if (processedEventIds.has(eventId)) {
    return false;
  }

  processedEventIds.add(eventId);
  if (processedEventIds.size > MAX_TRACKED_EVENT_IDS) {
    processedEventIds.delete(processedEventIds.values().next().value as string);
  }
  return true;
}
