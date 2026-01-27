import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  CustomError,
  Environment,
  IntervalUnit,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController,
  PaypalPaymentTokenUsageType,
  PlanRequestStatus,
  SubscriptionsController,
  TenureType,
  VaultController,
  VaultInstructionAction,
  VaultTokenRequestType,
} from "@paypal/paypal-server-sdk";

import type {
  BillingPlan,
  OAuthProviderError,
  OrderRequest,
  PlanRequest,
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

const BASE_URL = "https://api-m.sandbox.paypal.com";

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
const subscriptionsController = new SubscriptionsController(client);
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
    const { result, statusCode } = await ordersController.createOrder({
      body: orderRequestBody,
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
    const { result, statusCode } = await ordersController.captureOrder({
      id: orderId,
      prefer: "return=minimal",
      // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
      // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
      // paypalMockResponse: '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
      // paypalMockResponse: '{"mock_application_codes": "TRANSACTION_REFUSED"}'
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

/* ######################################################################
 * Subscription helpers
 * ###################################################################### */

/**
 * Creates a subscription using an existing plan ID (for production)
 */
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

/**
 * Creates a complete subscription flow for demo/testing
 * 1. Creates product, returns product ID
 * 2. Creates subscription plan using product ID, returns plan ID
 * 3. Creates subscription for buyer using plan ID
 */
export async function createSubscriptionWithSampleData() {
  try {
    // Create product
    const auth = Buffer.from(
      `${PAYPAL_SANDBOX_CLIENT_ID}:${PAYPAL_SANDBOX_CLIENT_SECRET}`,
    ).toString("base64");

    const productResponse = await fetch(`${BASE_URL}/v1/catalogs/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
        "PayPal-Request-Id": `product-${Date.now()}`,
      },
      body: JSON.stringify({
        name: "Sample Subscription Product",
        description: "Sample product for subscription testing",
        type: "SERVICE",
        category: "SOFTWARE",
      }),
    });

    if (!productResponse.ok) {
      throw new Error(`Product creation failed: ${productResponse.status}`);
    }

    const product = await productResponse.json();

    // Create billing plan
    const planRequestBody: PlanRequest = {
      productId: product.id,
      name: "Sample Monthly Plan",
      description: "$9.99/month subscription",
      status: PlanRequestStatus.Active,
      billingCycles: [
        {
          frequency: {
            intervalUnit: IntervalUnit.Month,
            intervalCount: 1,
          },
          tenureType: TenureType.Regular,
          sequence: 1,
          totalCycles: 0,
          pricingScheme: {
            fixedPrice: {
              currencyCode: "USD",
              value: "9.99",
            },
          },
        },
      ],
      paymentPreferences: {
        autoBillOutstanding: true,
        setupFee: {
          currencyCode: "USD",
          value: "0.00",
        },
        paymentFailureThreshold: 3,
      },
    };

    const { result: planResult, statusCode: planStatusCode } =
      await subscriptionsController.createBillingPlan({
        body: planRequestBody,
        prefer: "return=minimal",
        paypalRequestId: `plan-${Date.now()}`,
      });

    if (planStatusCode >= 400) {
      return {
        jsonResponse: planResult as CustomError,
        httpStatusCode: planStatusCode,
      };
    }

    const plan = planResult as BillingPlan;

    // Create subscription
    const { result, statusCode } =
      await subscriptionsController.createSubscription({
        body: { planId: plan.id! },
        prefer: "return=minimal",
        paypalRequestId: `subscription-${Date.now()}`,
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
