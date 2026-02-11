import express, { Request, Response } from "express";
import { join } from "path";
import { z } from "zod/v4";
import cors from "cors";

import type {
  PaymentTokenResponse,
  BillingPlan,
} from "@paypal/paypal-server-sdk";

import routes from "./routes/index";

import { createPaymentToken, createSubscription } from "./paypalServerSdk";

import {
  createMonthlySubscriptionBillingPlan,
  createSetupTokenForPayPalSavePayment,
  createSetupTokenForCardSavePayment,
  createOrderForFastlane,
  createOrderForCardOneTimePaymentWithThreeDSecure,
  createOrderForOneTimePaymentWithShipping,
} from "./paymentFlowPayloadVariations";

import errorMiddleware from "./middleware/errorMiddleware";
import { findEligibleMethods } from "./customApiEndpoints/findEligibleMethods";
import { CustomApiError } from "./customApiEndpoints/utils";

const CLIENT_STATIC_DIRECTORY =
  process.env.CLIENT_STATIC_DIRECTORY || join(__dirname, "../../../client");

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);
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

app.post(
  "/paypal-api/checkout/orders/create-order-for-fastlane",
  async (req: Request, res: Response) => {
    const schema = z.object({
      paymentToken: z.string(),
    });
    const { paymentToken } = schema.parse({
      paymentToken: req.body.paymentToken,
    });
    const { jsonResponse, httpStatusCode } = await createOrderForFastlane({
      paymentToken,
    });
    res.status(httpStatusCode).json(jsonResponse);
  },
);

app.post(
  "/paypal-api/checkout/orders/create-order-for-card-one-time-payment-with-3ds",
  async (req: Request, res: Response) => {
    const schema = z.object({
      referer: z.string().optional(),
    });
    const { referer } = schema.parse({ paymentToken: req.get("referer") });

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
      const jsonResponse = await findEligibleMethods({
        body: req.body,
        userAgent: z.string().parse(req.get("user-agent")),
      });

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
    const ngrok = await import("@ngrok/ngrok");

    const listener = await ngrok.connect({
      addr: port,
      authtoken: NGROK_AUTHTOKEN,
    });

    console.log(`Ingress secure tunnel established at: ${listener.url()}`);
  } catch (error) {
    console.error("error connecting to ngrok: ", error);
  }
}

app.use(errorMiddleware);

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
const hostname = process.env.HOSTNAME ?? "localhost";

app.listen({ port, hostname }, async () => {
  console.log(`Node.js web server listening at: http://${hostname}:${port}`);
  await setupNgrokForHTTPS(port);
});
