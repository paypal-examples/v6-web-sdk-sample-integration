import { config } from "dotenv";
import { join } from "path";

const envFilePath = join(__dirname, "../../../", ".env");
config({ path: envFilePath });

import {
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController,
} from "@paypal/paypal-server-sdk";

/* ######################################################################
 * Set up PayPal controllers
 * ###################################################################### */

const { PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_SANDBOX_CLIENT_SECRET } = process.env;

if (!PAYPAL_SANDBOX_CLIENT_ID || !PAYPAL_SANDBOX_CLIENT_SECRET) {
  throw new Error("Missing API credentials");
}

const client = new Client({
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

const ordersController = new OrdersController(client);
const oAuthAuthorizationController = new OAuthAuthorizationController(client);

/* ######################################################################
 * Token generation helpers
 * ###################################################################### */

export async function getBrowserSafeClientToken() {
  const auth = Buffer.from(
    `${PAYPAL_SANDBOX_CLIENT_ID}:${PAYPAL_SANDBOX_CLIENT_SECRET}`,
  ).toString("base64");

  const { body, ...httpResponse } =
    await oAuthAuthorizationController.requestToken(
      {
        authorization: `Basic ${auth}`,
      },
      { response_type: "client_token" },
    );

  return {
    jsonResponse: JSON.parse(String(body)),
    httpStatusCode: httpResponse.statusCode,
  };
}

/* ######################################################################
 * Process transactions
 * ###################################################################### */

export async function createOrder() {
  const { body, ...httpResponse } = await ordersController.ordersCreate({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: "100.00",
          },
        },
      ],
    },
    prefer: "return=minimal",
  });

  return {
    jsonResponse: JSON.parse(String(body)),
    httpStatusCode: httpResponse.statusCode,
  };
}

export async function captureOrder(orderId: string) {
  const { body, ...httpResponse } = await ordersController.ordersCapture({
    id: orderId,
    prefer: "return=minimal",
  });

  return {
    jsonResponse: JSON.parse(String(body)),
    httpStatusCode: httpResponse.statusCode,
  };
}
