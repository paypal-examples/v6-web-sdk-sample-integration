import { config } from "dotenv";
import { join } from "path";

const envFilePath = join(__dirname, "../../../", ".env");
config({ path: envFilePath });

import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController,
} from "@paypal/paypal-server-sdk";

import type { OrderRequest } from "@paypal/paypal-server-sdk";

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
  try {
    const auth = Buffer.from(
      `${PAYPAL_SANDBOX_CLIENT_ID}:${PAYPAL_SANDBOX_CLIENT_SECRET}`,
    ).toString("base64");

    const { body, statusCode } =
      await oAuthAuthorizationController.requestToken(
        {
          authorization: `Basic ${auth}`,
        },
        { response_type: "client_token" },
      );

    return {
      jsonResponse: JSON.parse(String(body)),
      httpStatusCode: statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const { statusCode, body } = error;
      return {
        jsonResponse: JSON.parse(String(body)),
        httpStatusCode: statusCode,
      };
    } else {
      throw error;
    }
  }
}

/* ######################################################################
 * Process transactions
 * ###################################################################### */

export async function createOrder(orderRequestBody: OrderRequest) {
  try {
    const { body, statusCode } = await ordersController.ordersCreate({
      body: orderRequestBody,
      prefer: "return=minimal",
    });

    return {
      jsonResponse: JSON.parse(String(body)),
      httpStatusCode: statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const { statusCode, body } = error;
      return {
        jsonResponse: JSON.parse(String(body)),
        httpStatusCode: statusCode,
      };
    } else {
      throw error;
    }
  }
}

export async function createOrderWithSampleData() {
  const defaultOrderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        amount: {
          currencyCode: "USD",
          value: "100.00",
        },
      },
    ],
  };
  return createOrder(defaultOrderRequestBody);
}

export async function captureOrder(orderId: string) {
  try {
    const { body, statusCode } = await ordersController.ordersCapture({
      id: orderId,
      prefer: "return=minimal",
    });

    return {
      jsonResponse: JSON.parse(String(body)),
      httpStatusCode: statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const { statusCode, body } = error;
      return {
        jsonResponse: JSON.parse(String(body)),
        httpStatusCode: statusCode,
      };
    } else {
      throw error;
    }
  }
}
