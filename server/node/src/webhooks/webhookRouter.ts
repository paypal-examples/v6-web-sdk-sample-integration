import express, { Router } from "express";
import type { NextFunction, Request, Response } from "express";

import {
  isPayPalWebhookIdSet,
  isWebhookDevelopmentModeEnabled,
} from "./verifyPayPalWebhook";
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
