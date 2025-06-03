import { config } from "dotenv";
import { join } from "path";

const envFilePath = join(__dirname, "../../../", ".env");
config({ path: envFilePath });

import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  CustomError,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController,
  PaypalPaymentTokenUsageType,
  VaultController,
  VaultInstructionAction,
  VaultTokenRequestType,
} from "@paypal/paypal-server-sdk";

import type {
  OAuthProviderError,
  OrderRequest,
  SetupTokenRequest,
} from "@paypal/paypal-server-sdk";

/* ######################################################################
 * Set up PayPal controllers
 * ###################################################################### */

const { DOMAINS, PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_SANDBOX_CLIENT_SECRET } =
  process.env;

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
const vaultController = new VaultController(client);

/* ######################################################################
 * Token generation helpers
 * ###################################################################### */

export async function getBrowserSafeClientToken() {
  try {
    const auth = Buffer.from(
      `${PAYPAL_SANDBOX_CLIENT_ID}:${PAYPAL_SANDBOX_CLIENT_SECRET}`,
    ).toString("base64");

    const fieldParameters = {
      response_type: "client_token",
      ...(DOMAINS ? { "domains[]": DOMAINS } : {}),
    };

    const { result, statusCode } =
      await oAuthAuthorizationController.requestToken(
        {
          authorization: `Basic ${auth}`,
        },
        fieldParameters,
      );

    // the OAuthToken interface is too general
    // this interface is specific to the "client_token" response type
    interface ClientToken {
      accessToken: string;
      expiresIn: number;
      scope: string;
      tokenType: string;
    }

    const { accessToken, expiresIn, scope, tokenType } = result;
    const transformedResult: ClientToken = {
      accessToken,
      // convert BigInt value to a Number
      expiresIn: Number(expiresIn),
      scope: String(scope),
      tokenType,
    };

    return {
      jsonResponse: transformedResult,
      httpStatusCode: statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const { result, statusCode } = error;
      type OAuthError = {
        error: OAuthProviderError;
        error_description?: string;
      };
      return {
        jsonResponse: result as OAuthError,
        httpStatusCode: statusCode,
      };
    } else {
      throw error;
    }
  }
}

/* ######################################################################
 * Process orders
 * ###################################################################### */

export async function createOrder({
  orderRequestBody,
  paypalRequestId,
}: {
  orderRequestBody: OrderRequest;
  paypalRequestId?: string;
}) {
  try {
    const { result, statusCode } = await ordersController.createOrder({
      body: orderRequestBody,
      ...(paypalRequestId ? { paypalRequestId } : {}),
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
    const { result, statusCode } = await ordersController.captureOrder({
      id: orderId,
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

/* ######################################################################
 * Save payment methods
 * ###################################################################### */

export async function createSetupToken(
  setupTokenRequestBody: SetupTokenRequest,
  paypalRequestId?: string,
) {
  try {
    const { result, statusCode } = await vaultController.createSetupToken({
      body: setupTokenRequestBody,
      paypalRequestId,
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

export async function createSetupTokenWithSampleDataForPayPal() {
  const defaultSetupTokenRequestBody = {
    paymentSource: {
      paypal: {
        experienceContext: {
          cancelUrl: "https://example.com/cancelUrl",
          returnUrl: "https://example.com/returnUrl",
          vaultInstruction: VaultInstructionAction.OnPayerApproval,
        },
        usageType: PaypalPaymentTokenUsageType.Merchant,
      },
    },
  };

  return createSetupToken(defaultSetupTokenRequestBody, Date.now().toString());
}

export async function createPaymentToken(
  vaultSetupToken: string,
  paypalRequestId?: string,
) {
  try {
    const { result, statusCode } = await vaultController.createPaymentToken({
      paypalRequestId: paypalRequestId ?? Date.now().toString(),
      body: {
        paymentSource: {
          token: {
            id: vaultSetupToken,
            type: VaultTokenRequestType.SetupToken,
          },
        },
      },
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
