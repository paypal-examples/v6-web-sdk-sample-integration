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
import { webhookAssistantPageHandler } from "./webhookAssistant";
import { webhookRouteHandler } from "./webhookRouteHandler";

// Registered here rather than in routes/index.ts so `paypal init` scaffolds,
// which regenerate routes/index.ts, still include it
export const webhookRouter = Router();

webhookRouter.post(
  "/paypal-api/webhooks/events",
  skipUnless(() => isPayPalWebhookIdSet() || isWebhookDevelopmentModeEnabled()),
  // every body is read raw, so one that isn't JSON simply fails verification
  express.raw({ type: () => true }),
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
