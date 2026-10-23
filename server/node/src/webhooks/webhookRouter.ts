import express, { Router } from "express";
import type { NextFunction, Request, Response } from "express";

import {
  isPayPalWebhookIdSet,
  isWebhookDevelopmentModeEnabled,
} from "./verifyPayPalWebhook";
import {
  clearInboxEventsRouteHandler,
  listInboxEventsRouteHandler,
} from "./inboxEvents";
import {
  webhookAssistantPageHandler,
  webhookAssistantScriptRouteHandler,
} from "./webhookAssistant";
import { webhookRouteHandler } from "./webhookRouteHandler";

// Registered here rather than in routes/index.ts so `paypal init` scaffolds,
// which regenerate routes/index.ts, still include it. Signature verification
// needs the raw body, so mount this before express.json().
export const webhookRouter = Router();

// until webhooks are configured, the route falls through to Express's usual 404
webhookRouter.post(
  "/paypal-api/webhooks/events",
  skipUnless(() => isPayPalWebhookIdSet() || isWebhookDevelopmentModeEnabled()),
  express.raw({ type: "application/json" }),
  webhookRouteHandler,
);

// the webhook inbox's list and Clear all; dev mode only, since the list
// includes payloads
webhookRouter.get(
  "/paypal-api/webhooks/events",
  skipUnless(isWebhookDevelopmentModeEnabled),
  listInboxEventsRouteHandler,
);

webhookRouter.delete(
  "/paypal-api/webhooks/events",
  skipUnless(isWebhookDevelopmentModeEnabled),
  clearInboxEventsRouteHandler,
);

webhookRouter.get(
  "/paypal-api/webhooks/webhook-assistant.js",
  skipUnless(isWebhookDevelopmentModeEnabled),
  webhookAssistantScriptRouteHandler,
);

// in dev mode, adds the webhook inbox to each sample page
webhookRouter.use("/client", webhookAssistantPageHandler);

// skips the route, so Express answers 404, unless the condition holds
function skipUnless(condition: () => boolean) {
  return (_request: Request, _response: Response, next: NextFunction) => {
    if (condition()) {
      next();
    } else {
      next("route");
    }
  };
}
