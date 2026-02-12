import {
  ApiError,
  Client,
  CustomError,
  Environment,
  LogLevel,
  SubscriptionsController,
} from "@paypal/paypal-server-sdk";

import type { PlanRequest } from "@paypal/paypal-server-sdk";

/* ######################################################################
 * Set up PayPal controllers
 * ###################################################################### */

const { PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_SANDBOX_CLIENT_SECRET } = process.env;

if (!PAYPAL_SANDBOX_CLIENT_ID || !PAYPAL_SANDBOX_CLIENT_SECRET) {
  throw new Error("Missing API credentials");
}

export const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_SANDBOX_CLIENT_ID,
    oAuthClientSecret: PAYPAL_SANDBOX_CLIENT_SECRET,
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: {
      logBody: true,
    },
    logResponse: {
      logHeaders: true,
    },
  },
});

const subscriptionsController = new SubscriptionsController(client);

/* ######################################################################
 * Subscription helpers
 * ###################################################################### */

export async function createSubscriptionBillingPlan(
  planRequestBody: PlanRequest,
  paypalRequestId?: string,
) {
  try {
    const { result, statusCode } =
      await subscriptionsController.createBillingPlan({
        body: planRequestBody,
        paypalRequestId,
        prefer: "return=minimal",
      });

    return {
      jsonResponse: result,
      httpStatusCode: statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const { result, statusCode } = error;
      return {
        jsonResponse: result as CustomError,
        httpStatusCode: statusCode,
      };
    } else {
      throw error;
    }
  }
}

export async function createSubscription(planId: string) {
  try {
    const { result, statusCode } =
      await subscriptionsController.createSubscription({
        body: { planId },
        prefer: "return=minimal",
      });

    return {
      jsonResponse: result,
      httpStatusCode: statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const { result, statusCode } = error;
      return {
        jsonResponse: result as CustomError,
        httpStatusCode: statusCode,
      };
    }
    throw error;
  }
}
