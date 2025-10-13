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

const {
  DOMAINS,
  PAYPAL_API_BASE_URL = "https://api-m.sandbox.paypal.com", // use https://api-m.paypal.com for production environment
  PAYPAL_SANDBOX_CLIENT_ID,
  PAYPAL_SANDBOX_CLIENT_SECRET,
  PAYPAL_MERCHANT_ID,
  PAYPAL_BN_CODE
} = process.env;

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

function getAuthAssertionToken(clientId: string, merchantId: string) {
  const header = {
    alg: 'none',
  };
  const body = {
    iss: clientId,
    payer_id: merchantId,
  };
  const signature = '';
  const jwtParts = [header, body, signature];

  const authAssertion = jwtParts
    .map((part) => part && btoa(JSON.stringify(part)))
    .join('.');

  return authAssertion;
}

export async function getClientToken() {
  try {
    if (!PAYPAL_SANDBOX_CLIENT_ID || !PAYPAL_SANDBOX_CLIENT_SECRET) {
      throw new Error('Missing API credentials');
    }

    const url = `${PAYPAL_API_BASE_URL}/v1/oauth2/token`;

    const headers = new Headers();

    const auth = Buffer.from(
      `${PAYPAL_SANDBOX_CLIENT_ID}:${PAYPAL_SANDBOX_CLIENT_SECRET}`,
    ).toString('base64');

    headers.append('Authorization', `Basic ${auth}`);
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    if (PAYPAL_MERCHANT_ID) {
      headers.append(
        'PayPal-Auth-Assertion',
        getAuthAssertionToken(PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_MERCHANT_ID),
      );
    }

    const searchParams = new URLSearchParams();
    searchParams.append('grant_type', 'client_credentials');
    searchParams.append('response_type', 'client_token');
    searchParams.append('intent', 'sdk_init');
    if (DOMAINS) {
      searchParams.append('domains[]', DOMAINS);
    }

    const options = {
      method: 'POST',
      headers,
      body: searchParams,
    };

    const response = await fetch(url, options);
    const data = await response.json();

    return data.access_token;
  } catch (error) {
    console.error(error);

    return '';
  }
}

export async function getBrowserSafeClientToken() {
  try {
    const auth = Buffer.from(
      `${PAYPAL_SANDBOX_CLIENT_ID}:${PAYPAL_SANDBOX_CLIENT_SECRET}`,
    ).toString("base64");

    const fieldParameters = {
      response_type: "client_token",
      // the Fastlane component requires this domains[] parameter
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
    type CreateOrderOptions = {
      body: OrderRequest;
      paypalRequestId?: string;
      prefer?: string;
      paypalAuthAssertion?: string;
      paypalPartnerAttributionId?: string;
    }
    const options: CreateOrderOptions = {
      body: orderRequestBody,
      paypalRequestId,
      prefer: "return=minimal",
    };
    if (PAYPAL_SANDBOX_CLIENT_ID && PAYPAL_MERCHANT_ID) {
      options.paypalAuthAssertion = getAuthAssertionToken(PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_MERCHANT_ID);
      options.paypalPartnerAttributionId = PAYPAL_BN_CODE
    }
    const { result, statusCode } = await ordersController.createOrder(options);

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
  const orderRequestBody = {
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
  return createOrder({ orderRequestBody });
}

export async function captureOrder(orderId: string) {
  try {
    type CaptureOrderOptions = {
      id: string;
      prefer?: string;
      paypalAuthAssertion?: string;
    }
    const options: CaptureOrderOptions = {
      id: orderId,
      prefer: "return=minimal",
    };
    if (PAYPAL_SANDBOX_CLIENT_ID && PAYPAL_MERCHANT_ID) {
      options.paypalAuthAssertion = getAuthAssertionToken(PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_MERCHANT_ID);
    }
    const { result, statusCode } = await ordersController.captureOrder(options);

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
