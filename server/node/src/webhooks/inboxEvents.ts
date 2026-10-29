import type { Request, Response } from "express";

import { MAX_INBOX_EVENTS, WEBHOOK_EVENT_NAMES } from "./constants";
import type { InboxEvent, WebhookEvent } from "./types";
import { isWebhookDevelopmentModeEnabled } from "./verifyPayPalWebhook";

let inboxEvents: InboxEvent[] = [];

export function recordInboxEvent(event: WebhookEvent): void {
  if (!isWebhookDevelopmentModeEnabled()) {
    return;
  }
  if (inboxEvents.some(({ id }) => id === event.id)) {
    return;
  }

  const inboxEvent: InboxEvent = {
    id: event.id,
    type: event.event_type,
    receivedAt: new Date().toISOString(),
    payload: event,
  };
  inboxEvents = [inboxEvent, ...inboxEvents].slice(0, MAX_INBOX_EVENTS);
}

export function listInboxEventsRouteHandler(
  _request: Request,
  response: Response,
) {
  response.json({
    entries: inboxEvents,
    names: WEBHOOK_EVENT_NAMES,
  });
}

// Clear all: removes the given event and every older one, keeping any that
// arrived since
export function clearInboxEventsRouteHandler(
  request: Request,
  response: Response,
) {
  const { through } = request.query;
  if (typeof through !== "string" || through === "") {
    response
      .status(400)
      .json({ error: "through must name the newest event to clear" });
    return;
  }

  // not found means it was already dropped, along with everything older
  const index = inboxEvents.findIndex(({ id }) => id === through);
  if (index !== -1) {
    inboxEvents = inboxEvents.slice(0, index);
  }
  response.status(204).end();
}
