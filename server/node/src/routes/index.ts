import { Router } from "express";

import {
  clientTokenRouteHandler,
  clientIdRouteHandler,
} from "./authRouteHandler";

import {
  createOrderForOneTimePaymentRouteHandler,
  createOrderForPayPalOneTimePaymentRouteHandler,
  createOrderForPayPalOneTimePaymentWithVaultRouteHandler,
  createOrderForOneTimePaymentWithShippingRouteHandler,
  createOrderForCardWithSingleUseTokenRouteHandler,
  createOrderForCardWithThreeDSecureRouteHandler,
  captureOrderRouteHandler,
} from "./ordersRouteHandler";

import { getProductsRouteHandler } from "./productsRouteHandler";

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
  "/paypal-api/checkout/orders/create-order-for-paypal-one-time-payment-with-vault",
  createOrderForPayPalOneTimePaymentWithVaultRouteHandler,
);

router.post(
  "/paypal-api/checkout/orders/create-order-for-one-time-payment-with-shipping",
  createOrderForOneTimePaymentWithShippingRouteHandler,
);

router.post(
  "/paypal-api/checkout/orders/create-order-for-card-with-single-use-token",
  createOrderForCardWithSingleUseTokenRouteHandler,
);

router.post(
  "/paypal-api/checkout/orders/create-order-for-card-one-time-payment-with-3ds",
  createOrderForCardWithThreeDSecureRouteHandler,
);

router.post(
  "/paypal-api/checkout/orders/:orderId/capture",
  captureOrderRouteHandler,
);

router.get("/paypal-api/products", getProductsRouteHandler);

export default router;
