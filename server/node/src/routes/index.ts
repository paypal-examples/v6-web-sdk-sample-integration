import { Router } from "express";

import {
  clientTokenRouteHandler,
  clientIdRouteHandler,
} from "./authRouteHandler";

import {
  createOrderForOneTimePaymentRouteHandler,
  createOrderForPayPalOneTimePaymentRouteHandler,
  captureOrderRouteHandler,
} from "./ordersRouteHandler";

const router = Router();

router.get(
  "/paypal-api/auth/browser-safe-client-token",
  clientTokenRouteHandler,
);

router.get("/paypal-api/auth/browser-safe-client-id", clientIdRouteHandler);

router.post(
  "/paypal-api/checkout/orders/create-order-for-one-time-payment",
  createOrderForOneTimePaymentRouteHandler,
);

router.post(
  "/paypal-api/checkout/orders/create-order-for-paypal-one-time-payment-with-redirect",
  createOrderForPayPalOneTimePaymentRouteHandler,
);

router.post(
  "/paypal-api/checkout/orders/:orderId/capture",
  captureOrderRouteHandler,
);

export default router;
