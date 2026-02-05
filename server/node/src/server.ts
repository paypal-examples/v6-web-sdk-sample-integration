import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { join } from "path";
import ngrok from "@ngrok/ngrok";

import type {
  PaymentTokenResponse,
  BillingPlan,
} from "@paypal/paypal-server-sdk";

import {
  getBrowserSafeClientToken,
  captureOrder,
  createPaymentToken,
  createSubscription,
} from "./paypalServerSdk";

import {
  createMonthlySubscriptionBillingPlan,
  createOrderForOneTimePayment,
  createOrderForPayPalOneTimePaymentWithRedirect,
  createOrderForPayPalOneTimePaymentWithVault,
  createSetupTokenForPayPalSavePayment,
  createSetupTokenForCardSavePayment,
  createOrderForFastlane,
  createOrderForCardOneTimePaymentWithThreeDSecure,
  createOrderForOneTimePaymentWithShipping,
} from "./paymentFlowPayloadVariations";

import { findEligibleMethods } from "./customApiEndpoints/findEligibleMethods";
import { CustomApiError } from "./customApiEndpoints/utils";
import { getAllProducts, getProductPrice } from "./productCatalog";

const CLIENT_STATIC_DIRECTORY =
  process.env.CLIENT_STATIC_DIRECTORY || join(__dirname, "../../../client");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/client", express.static(CLIENT_STATIC_DIRECTORY));

/* ######################################################################
 * Entry point for client examples containing HTML, JS, and CSS
 * ###################################################################### */

app.get("/", (_req: Request, res: Response) => {
  res.redirect("/client/index.html");
});

/* ######################################################################
 * API Endpoints for the client-side JavaScript PayPal Integration code
 * ###################################################################### */

app.get(
  "/paypal-api/auth/browser-safe-client-token",
  async (_req: Request, res: Response) => {
    const { jsonResponse, httpStatusCode } = await getBrowserSafeClientToken();
    res.status(httpStatusCode).json(jsonResponse);
  },
);

/*
 * For convenience, this API endpoint returns the PayPal Client ID to the front-end.
 * This way the .env file can be the single source of truth for the Client ID.
 * It is safe for merchant developers to hardcode Client ID values in front-end JavaScript/HTML files.
 */
app.get(
  "/paypal-api/auth/browser-safe-client-id",
  (_req: Request, res: Response) => {
    const { PAYPAL_SANDBOX_CLIENT_ID } = process.env;

    if (!PAYPAL_SANDBOX_CLIENT_ID) {
      throw new Error(
        "PAYPAL_SANDBOX_CLIENT_ID environment variable is not defined",
      );
    }
    res.status(200).json({ clientId: PAYPAL_SANDBOX_CLIENT_ID });
  },
);

app.get("/paypal-api/products", (_req: Request, res: Response) => {
  const products = getAllProducts();
  res.status(200).json(products);
});

app.post(
  "/paypal-api/checkout/orders/create-order-for-one-time-payment",
  async (_req: Request, res: Response) => {
    const { jsonResponse, httpStatusCode } = await createOrderForOneTimePayment(
      { amountValue: "100.00" },
    );
    res.status(httpStatusCode).json(jsonResponse);
  },
);

app.post(
  "/paypal-api/checkout/orders/create-dynamic-order-for-one-time-payment",
  async (req: Request, res: Response) => {
    const { cart } = req.body;

    // Validate cart is provided
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Cart is required and must contain at least one item",
      });
    }

    // Calculate total from product catalog
    let total = 0;
    const invalidItems: string[] = [];

    for (const item of cart) {
      if (
        !item.sku ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          error: "Invalid cart item",
          message: "Each item must have a valid sku and quantity > 0",
        });
      }

      const price = getProductPrice(item.sku);
      if (!price) {
        invalidItems.push(item.sku);
        continue;
      }

      total += parseFloat(price) * item.quantity;
    }

    // Check for invalid SKUs
    if (invalidItems.length > 0) {
      return res.status(404).json({
        error: "Products not found",
        message: `The following SKUs are not in the catalog: ${invalidItems.join(", ")}`,
      });
    }

    const { jsonResponse, httpStatusCode } = await createOrderForOneTimePayment(
      { amountValue: total.toFixed(2) },
    );
    res.status(httpStatusCode).json(jsonResponse);
  },
);

app.post(
  "/paypal-api/checkout/orders/create-order-for-one-time-payment-with-currency-code-eur",
  async (_req: Request, res: Response) => {
    const { jsonResponse, httpStatusCode } = await createOrderForOneTimePayment(
      { currencyCode: "EUR" },
    );
    res.status(httpStatusCode).json(jsonResponse);
  },
);

app.post(
  "/paypal-api/checkout/orders/create-order-for-one-time-payment-with-currency-code-pln",
  async (_req: Request, res: Response) => {
    const { jsonResponse, httpStatusCode } = await createOrderForOneTimePayment(
      { currencyCode: "PLN" },
    );
    res.status(httpStatusCode).json(jsonResponse);
  },
);

app.post(
  "/paypal-api/checkout/orders/create-order-for-paypal-one-time-payment-with-redirect",
  async (req: Request, res: Response) => {
    const referer = req.get("referer") as string;
    const { jsonResponse, httpStatusCode } =
      await createOrderForPayPalOneTimePaymentWithRedirect({
        returnUrl: referer,
        cancelUrl: referer,
      });
    res.status(httpStatusCode).json(jsonResponse);
  },
);

app.post(
  "/paypal-api/checkout/orders/create-order-for-paypal-one-time-payment-with-vault",
  async (_req: Request, res: Response) => {
    const { jsonResponse, httpStatusCode } =
      await createOrderForPayPalOneTimePaymentWithVault();
    res.status(httpStatusCode).json(jsonResponse);
  },
);

app.post(
  "/paypal-api/checkout/orders/:orderId/capture",
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId as string;
    const { jsonResponse, httpStatusCode } = await captureOrder(orderId);
    res.status(httpStatusCode).json(jsonResponse);
  },
);

app.post(
  "/paypal-api/checkout/orders/create-order-for-fastlane",
  async (req: Request, res: Response) => {
    const { paymentToken } = req.body;
    const { jsonResponse, httpStatusCode } = await createOrderForFastlane({
      paymentToken,
    });
    res.status(httpStatusCode).json(jsonResponse);
  },
);

app.post(
  "/paypal-api/checkout/orders/create-order-for-card-one-time-payment-with-3ds",
  async (req: Request, res: Response) => {
    const referer = req.get("referer") as string;
    const { jsonResponse, httpStatusCode } =
      await createOrderForCardOneTimePaymentWithThreeDSecure({
        returnUrl: referer,
        cancelUrl: referer,
      });
    res.status(httpStatusCode).json(jsonResponse);
  },
);

app.post(
  "/paypal-api/checkout/orders/create-order-for-one-time-payment-with-shipping",
  async (_req: Request, res: Response) => {
    const { jsonResponse, httpStatusCode } =
      await createOrderForOneTimePaymentWithShipping();
    res.status(httpStatusCode).json(jsonResponse);
  },
);

app.post(
  "/paypal-api/billing/create-subscription",
  async (_req: Request, res: Response) => {
    let planId = process.env.PAYPAL_SUBSCRIPTION_PLAN_ID;

    if (!planId) {
      const { jsonResponse } = await createMonthlySubscriptionBillingPlan();
      const billingPlanResponse = jsonResponse as BillingPlan;
      if (!billingPlanResponse.id) {
        throw new Error("Failed to create subscription billing plan");
      }
      planId = billingPlanResponse.id;
    }

    const { jsonResponse, httpStatusCode } = await createSubscription(planId);
    res.status(httpStatusCode).json(jsonResponse);
  },
);

app.post(
  "/paypal-api/vault/create-setup-token-for-paypal-save-payment",
  async (_req: Request, res: Response) => {
    const { jsonResponse, httpStatusCode } =
      await createSetupTokenForPayPalSavePayment();
    res.status(httpStatusCode).json(jsonResponse);
  },
);

app.post(
  "/paypal-api/vault/create-setup-token-for-card-save-payment",
  async (_req: Request, res: Response) => {
    const { jsonResponse, httpStatusCode } =
      await createSetupTokenForCardSavePayment();
    res.status(httpStatusCode).json(jsonResponse);
  },
);

app.post(
  "/paypal-api/payments/find-eligible-methods",
  async (req: Request, res: Response) => {
    try {
      const jsonResponse = await findEligibleMethods(req.body);
      res.status(200).json(jsonResponse);
    } catch (error) {
      console.error("Failed to find eligible methods:", error);

      if ((error as CustomApiError)?.statusCode) {
        const { statusCode, jsonResponse } = error as CustomApiError;
        res.status(statusCode).json(jsonResponse);
      }
      throw error;
    }
  },
);

app.post(
  "/paypal-api/vault/payment-token/create",
  async (req: Request, res: Response) => {
    const { jsonResponse, httpStatusCode } = await createPaymentToken(
      req.body.vaultSetupToken as string,
    );

    const paymentTokenResponse = jsonResponse as PaymentTokenResponse;

    if (paymentTokenResponse.id) {
      // This payment token id is a long-lived value for making
      // future payments when the buyer is not present.
      // PayPal recommends storing this value in your database
      // and NOT returning it back to the browser.
      await savePaymentTokenToDatabase(paymentTokenResponse);
      res.status(httpStatusCode).json({
        status: "SUCCESS",
        description: "Payment token saved to database for future transactions",
      });
    } else {
      res.status(httpStatusCode).json({
        status: "ERROR",
        description: "Failed to create payment token",
      });
    }
  },
);

async function savePaymentTokenToDatabase(
  _paymentTokenResponse: PaymentTokenResponse,
) {
  // example function to teach saving the paymentToken to a database
  // to be used for future transactions
  return Promise.resolve();
}

async function setupNgrokForHTTPS(port: number) {
  const { NGROK_AUTHTOKEN } = process.env;

  if (!NGROK_AUTHTOKEN) {
    return;
  }

  try {
    const listener = await ngrok.connect({
      addr: port,
      authtoken: NGROK_AUTHTOKEN,
    });

    console.log(`Ingress secure tunnel established at: ${listener.url()}`);
  } catch (error) {
    console.error("error connecting to ngrok: ", error);
  }
}

app.use(
  (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    response.status(500).json({
      error: "Internal Server Error",
      errorDescription: error.toString(),
    });
  },
);

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
const hostname = process.env.HOSTNAME ?? "localhost";

app.listen({ port, hostname }, async () => {
  console.log(`Node.js web server listening at: http://${hostname}:${port}`);
  await setupNgrokForHTTPS(port);
});
