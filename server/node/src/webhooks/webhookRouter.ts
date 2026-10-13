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

webhookRouter.post(
  "/paypal-api/webhooks/events",
  skipUnlessWebhooksConfigured,
  express.raw({ type: "application/json" }),
  webhookRouteHandler,
);

// until webhooks are configured, fall through to Express's usual 404
function skipUnlessWebhooksConfigured(
  _request: Request,
  _response: Response,
  next: NextFunction,
) {
  if (isPayPalWebhookIdSet() || isWebhookDevelopmentModeEnabled()) {
    next();
  } else {
    next("route");
  }
}
