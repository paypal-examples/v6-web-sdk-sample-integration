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
  getOrderRouteHandler,
  captureOrderRouteHandler,
} from "./ordersRouteHandler";

import {
  createSetupTokenForPayPalSavePaymentRouteHandler,
  createSetupTokenForCardSavePaymentRouteHandler,
  createPaymentTokenRouteHandler,
} from "./vaultRouteHandler";

import { createSubscriptionRouteHandler } from "./subscriptionsRouteHandler";
import { findEligibleMethodsRouteHandler } from "./findEligibleMethodsRouteHandler";
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
  "/paypal-api/checkout/orders/create-order-with-custom-payload",
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

router.get(
  "/paypal-api/checkout/orders/:orderId",
  getOrderRouteHandler,
);

router.post(
  "/paypal-api/checkout/orders/:orderId/capture",
  captureOrderRouteHandler,
);

router.post(
  "/paypal-api/vault/create-setup-token-for-paypal-save-payment",
  createSetupTokenForPayPalSavePaymentRouteHandler,
);

router.post(
  "/paypal-api/vault/create-setup-token-for-card-save-payment",
  createSetupTokenForCardSavePaymentRouteHandler,
);

router.post(
  "/paypal-api/vault/payment-token/create",
  createPaymentTokenRouteHandler,
);

router.post(
  "/paypal-api/billing/create-subscription",
  createSubscriptionRouteHandler,
);

router.post(
  "/paypal-api/payments/find-eligible-methods",
  findEligibleMethodsRouteHandler,
);

router.get("/paypal-api/products", getProductsRouteHandler);

export default router;
