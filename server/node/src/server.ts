import express, { Request, Response } from "express";
import { join } from "path";
import { z } from "zod/v4";
import cors from "cors";

import type { BillingPlan } from "@paypal/paypal-server-sdk";

import routes from "./routes/index";

import { createSubscription } from "./paypalServerSdk";

import { createMonthlySubscriptionBillingPlan } from "./paymentFlowPayloadVariations";

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
