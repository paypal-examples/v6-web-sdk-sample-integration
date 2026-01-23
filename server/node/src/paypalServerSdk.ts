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
  CreateSubscriptionRequest,
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
const subscriptionsController = new SubscriptionsController(client);

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
  * Create Subscription
* ###################################################################### */

async function createProduct() {
  const auth = Buffer.from(
    `${PAYPAL_SANDBOX_CLIENT_ID}:${PAYPAL_SANDBOX_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(
    "https://api-m.sandbox.paypal.com/v1/catalogs/products",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
        "PayPal-Request-Id": `product-${Date.now()}`,
      },
      body: JSON.stringify({
        name: "Sample Subscription Product",
        description: "A sample product for subscription testing",
        type: "SERVICE",
        category: "SOFTWARE",
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to create product: ${response.status}`);
  }

  return response.json();
}

export async function createBillingPlanWithSampleData() {
  try {
    // Create a product first
    const product = await createProduct();
    const productId = product.id;

    const planRequestBody: PlanRequest = {
      productId: productId,
      name: "Sample Monthly Subscription Plan",
      description: "A sample subscription plan - $9.99/month",
      status: PlanRequestStatus.Active,
      billingCycles: [
        {
          frequency: {
            intervalUnit: IntervalUnit.Month,
            intervalCount: 1,
          },
          tenureType: TenureType.Regular,
          sequence: 1,
          totalCycles: 0, // 0 = infinite
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

    const { result, statusCode } =
      await subscriptionsController.createBillingPlan({
        body: planRequestBody,
        prefer: "return=representation",
        paypalRequestId: `plan-${Date.now()}`,
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

export async function createSubscriptionWithSampleData() {
  // Step 1: Create a billing plan (which creates a product)
  const planResult = await createBillingPlanWithSampleData();

  if (planResult.httpStatusCode >= 400) {
    return planResult;
  }

  const billingPlan = planResult.jsonResponse as BillingPlan;

  if (!billingPlan.id) {
    throw new Error("Failed to create billing plan - no ID returned");
  }

  // Step 2: Create subscription with the plan
  try {
    const subscriptionRequestBody: CreateSubscriptionRequest = {
      planId: billingPlan.id,
    };

    const { result, statusCode } =
      await subscriptionsController.createSubscription({
        body: subscriptionRequestBody,
        prefer: "return=representation",
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
    } else {
      throw error;
    }
  }
}