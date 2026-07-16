import {
  CheckoutPaymentIntent,
  OrdersCardVerificationMethod,
  OrdersController,
  PaypalExperienceUserAction,
  PaypalPaymentTokenCustomerType,
  PaypalPaymentTokenUsageType,
  PaypalWalletContextShippingPreference,
  ProcessingInstruction,
  ShippingType,
  StoreInVaultInstruction,
} from "@paypal/paypal-server-sdk";
import { z } from "zod/v4";
import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";

import { client } from "../paypalServerSdkClient";
import { getAllProducts, getProduct } from "../productCatalog";

const ordersController = new OrdersController(client);

const OneTimePaymentSchema = z
  .object({
    cart: z
      .array(
        z.object({
          sku: z.enum(getAllProducts().map(({ sku }) => sku)),
          quantity: z.number().int().positive().min(1).max(10),
        }),
      )
      .default([
        { sku: getAllProducts()[0].sku, quantity: 2 },
        { sku: getAllProducts()[1].sku, quantity: 1 },
      ]),
    intent: z
      .enum(CheckoutPaymentIntent)
      .default(CheckoutPaymentIntent.Capture),
    currencyCode: z.string().length(3).default("USD"),
    processingInstruction: z.enum(ProcessingInstruction).optional(),
    returnUrl: z.url().optional(),
    cancelUrl: z.url().optional(),
  })
  .transform((data) => {
    const { items, totalAmount } = calculateCartAmount(
      data.cart,
      data.currencyCode,
    );
    return {
      ...data,
      totalAmount,
      items,
    };
  });

function calculateCartAmount(
  cart: { sku: string; quantity: number }[],
  currencyCode: string,
) {
  type Item = {
    sku: string;
    name: string;
    quantity: string;
    unitAmount: {
      currencyCode: string;
      value: string;
    };
  };

  const items: Item[] = [];
  let totalAmount = 0;

  for (const { sku, quantity } of cart) {
    const { name, price } = getProduct(sku);
    totalAmount += Number(price) * quantity;
    items.push({
      sku,
      name,
      quantity: String(quantity),
      unitAmount: {
        currencyCode,
        value: price,
      },
    });
  }

  return {
    totalAmount: totalAmount.toFixed(2),
    items,
  };
}

export async function createOrderForOneTimePaymentRouteHandler(
  request: Request,
  response: Response,
) {
  const { currencyCode, totalAmount, items, intent, processingInstruction } =
    OneTimePaymentSchema.parse(request.body ?? {});

  const orderRequestBody = {
    intent,
    ...(processingInstruction && { processingInstruction }),
    purchaseUnits: [
      {
        amount: {
          currencyCode,
          value: totalAmount,
          breakdown: {
            itemTotal: {
              currencyCode: currencyCode,
              value: totalAmount,
            },
          },
        },
        items,
      },
    ],
  };

  const { result, statusCode } = await ordersController.createOrder({
    body: orderRequestBody,
    paypalRequestId: randomUUID(),
    prefer: "return=minimal",
  });

  response.status(statusCode).json(result);
}

export async function createOrderForPayPalOneTimePaymentRouteHandler(
  request: Request,
  response: Response,
) {
  const { currencyCode, totalAmount, items, returnUrl, cancelUrl, intent } =
    OneTimePaymentSchema.transform((data) => {
      return {
        ...data,
        returnUrl:
          data.returnUrl ??
          request.get("referer") ??
          "https://www.example.com/success",
        cancelUrl:
          data.cancelUrl ??
          request.get("referer") ??
          "https://www.example.com/cancel",
      };
    }).parse(request.body ?? {});

  const orderRequestBody = {
    intent,
    purchaseUnits: [
      {
        amount: {
          currencyCode,
          value: totalAmount,
          breakdown: {
            itemTotal: {
              currencyCode: currencyCode,
              value: totalAmount,
            },
          },
        },
        items,
      },
    ],
    paymentSource: {
      paypal: {
        experienceContext: {
          returnUrl,
          cancelUrl,
          userAction: PaypalExperienceUserAction.Continue,
          shippingPreference: PaypalWalletContextShippingPreference.NoShipping,
        },
      },
    },
  };

  const { result, statusCode } = await ordersController.createOrder({
    body: orderRequestBody,
    paypalRequestId: randomUUID(),
    prefer: "return=minimal",
  });

  response.status(statusCode).json(result);
}

export async function createOrderForPayPalOneTimePaymentWithVaultRouteHandler(
  request: Request,
  response: Response,
) {
  const { currencyCode, totalAmount, items, returnUrl, cancelUrl, intent } =
    OneTimePaymentSchema.transform((data) => {
      return {
        ...data,
        returnUrl:
          data.returnUrl ??
          request.get("referer") ??
          "https://www.example.com/success",
        cancelUrl:
          data.cancelUrl ??
          request.get("referer") ??
          "https://www.example.com/cancel",
      };
    }).parse(request.body ?? {});

  const orderRequestBody = {
    intent,
    purchaseUnits: [
      {
        amount: {
          currencyCode,
          value: totalAmount,
          breakdown: {
            itemTotal: {
              currencyCode: currencyCode,
              value: totalAmount,
            },
          },
        },
        items,
      },
    ],
    paymentSource: {
      paypal: {
        attributes: {
          vault: {
            storeInVault: StoreInVaultInstruction.OnSuccess,
            usageType: PaypalPaymentTokenUsageType.Merchant,
            customerType: PaypalPaymentTokenCustomerType.Consumer,
          },
        },
        experienceContext: {
          returnUrl,
          cancelUrl,
          shippingPreference: PaypalWalletContextShippingPreference.NoShipping,
        },
      },
    },
  };

  const { result, statusCode } = await ordersController.createOrder({
    body: orderRequestBody,
    paypalRequestId: randomUUID(),
    prefer: "return=minimal",
  });

  response.status(statusCode).json(result);
}

export async function createOrderForApplePayOneTimePaymentWithVaultRouteHandler(
  request: Request,
  response: Response,
) {
  const { currencyCode, totalAmount, items, intent } =
    OneTimePaymentSchema.parse(request.body ?? {});

  const orderRequestBody = {
    intent,
    purchaseUnits: [
      {
        amount: {
          currencyCode,
          value: totalAmount,
          breakdown: {
            itemTotal: {
              currencyCode: currencyCode,
              value: totalAmount,
            },
          },
        },
        items,
      },
    ],
    paymentSource: {
      applePay: {
        attributes: {
          vault: {
            storeInVault: StoreInVaultInstruction.OnSuccess,
          },
        },
      },
    },
  };

  const { result, statusCode } = await ordersController.createOrder({
    body: orderRequestBody,
    paypalRequestId: randomUUID(),
    prefer: "return=minimal",
  });

  response.status(statusCode).json(result);
}

export async function createOrderForOneTimePaymentWithShippingRouteHandler(
  request: Request,
  response: Response,
) {
  const { currencyCode, totalAmount, items, intent } =
    OneTimePaymentSchema.parse(request.body ?? {});

  const orderRequestBody = {
    intent,
    purchaseUnits: [
      {
        amount: {
          currencyCode,
          value: totalAmount,
          breakdown: {
            itemTotal: {
              currencyCode: currencyCode,
              value: totalAmount,
            },
          },
        },
        items,
        shipping: {
          options: [
            {
              id: "SHIP_FRE",
              label: "Free",
              type: ShippingType.Shipping,
              selected: true,
              amount: {
                value: "0.00",
                currencyCode,
              },
            },
            {
              id: "SHIP_EXP",
              label: "Expedited",
              type: ShippingType.Shipping,
              selected: false,
              amount: {
                value: "5.00",
                currencyCode,
              },
            },
            {
              id: "IN_STORE",
              label: "Pickup in Store",
              type: ShippingType.PickupInStore,
              selected: false,
              amount: {
                value: "0.00",
                currencyCode,
              },
            },
          ],
        },
      },
    ],
  };

  const { result, statusCode } = await ordersController.createOrder({
    body: orderRequestBody,
    paypalRequestId: randomUUID(),
    prefer: "return=minimal",
  });

  response.status(statusCode).json(result);
}

export async function createOrderForCardWithSingleUseTokenRouteHandler(
  request: Request,
  response: Response,
) {
  const { paymentToken } = z
    .object({
      paymentToken: z.string(),
    })
    .parse({ paymentToken: request.body.paymentToken });

  const { currencyCode, totalAmount, items, intent } =
    OneTimePaymentSchema.parse(request.body);

  const orderRequestBody = {
    intent,
    purchaseUnits: [
      {
        amount: {
          currencyCode,
          value: totalAmount,
          breakdown: {
            itemTotal: {
              currencyCode: currencyCode,
              value: totalAmount,
            },
          },
        },
        items,
      },
    ],
    paymentSource: {
      card: {
        singleUseToken: paymentToken,
      },
    },
  };

  const { result, statusCode } = await ordersController.createOrder({
    body: orderRequestBody,
    paypalRequestId: randomUUID(),
    prefer: "return=minimal",
  });

  response.status(statusCode).json(result);
}

export async function createOrderForCardWithThreeDSecureRouteHandler(
  request: Request,
  response: Response,
) {
  const { currencyCode, totalAmount, items, returnUrl, cancelUrl, intent } =
    OneTimePaymentSchema.transform((data) => {
      return {
        ...data,
        returnUrl:
          data.returnUrl ??
          request.get("referer") ??
          "https://www.example.com/success",
        cancelUrl:
          data.cancelUrl ??
          request.get("referer") ??
          "https://www.example.com/cancel",
      };
    }).parse(request.body ?? {});

  const orderRequestBody = {
    intent,
    purchaseUnits: [
      {
        amount: {
          currencyCode,
          value: totalAmount,
          breakdown: {
            itemTotal: {
              currencyCode: currencyCode,
              value: totalAmount,
            },
          },
        },
        items,
      },
    ],
    paymentSource: {
      card: {
        attributes: {
          verification: {
            // use "ScaAlways" to test 3D Secure
            // https://developer.paypal.com/docs/checkout/advanced/customize/3d-secure/test/
            method: OrdersCardVerificationMethod.ScaAlways,
          },
        },
        experienceContext: {
          returnUrl,
          cancelUrl,
        },
      },
    },
  };

  const { result, statusCode } = await ordersController.createOrder({
    body: orderRequestBody,
    paypalRequestId: randomUUID(),
    prefer: "return=minimal",
  });

  response.status(statusCode).json(result);
}

export async function getOrderRouteHandler(
  request: Request,
  response: Response,
) {
  const schema = z.object({
    orderId: z.string(),
  });

  const { orderId } = schema.parse(request.params);

  const { result, statusCode } = await ordersController.getOrder({
    id: orderId,
  });

  if (statusCode === 200) {
    // return the minimal amount of Order information back to the browser
    const { id, paymentSource, purchaseUnits, status, links } = result;
    return response.status(200).json({
      id,
      paymentSource,
      purchaseUnits: purchaseUnits?.map(({ referenceId, payments }) => ({
        referenceId,
        payments,
      })),
      status,
      links,
    });
  }

  response.status(statusCode).json(result);
}

export async function captureOrderRouteHandler(
  request: Request,
  response: Response,
) {
  const schema = z.object({
    orderId: z.string(),
  });

  const { orderId } = schema.parse(request.params);

  const { result, statusCode } = await ordersController.captureOrder({
    id: orderId,
    prefer: "return=minimal",
    paypalRequestId: randomUUID(),
    // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
    // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
    // paypalMockResponse: '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
    // paypalMockResponse: '{"mock_application_codes": "TRANSACTION_REFUSED"}'
  });

  response.status(statusCode).json(result);
}

/**
 * Persists the buyer's authorization (consent) record to comply with NACHA.
 *
 * PayPal does not store the authorization on your behalf, so you must store it
 * for every ACH transaction. Storage is hosted by the merchant. This demo just
 * logs the record to the console.
 *
 * @param authorizationRecord - The consent record to persist
 */
async function storeConsent(authorizationRecord: Record<string, unknown>) {
  console.log(
    "Storing ACH authorization (consent) record for NACHA compliance:",
    authorizationRecord,
  );
}

/**
 * Single endpoint for the ACH wallet flow: retrieves the order details, stores
 * the buyer's authorization (consent) record for NACHA compliance, then captures
 * the payment. The order status must be APPROVED before you capture.
 *
 * @param request - Express request; `params.orderId` is the approved order ID
 * @param response - Express response
 */
export async function captureAchWalletOrderRouteHandler(
  request: Request,
  response: Response,
) {
  const { orderId } = z.object({ orderId: z.string() }).parse(request.params);

  // 1. Retrieve order details to build the NACHA authorization record.
  const { result: orderDetails, statusCode: getStatusCode } =
    await ordersController.getOrder({ id: orderId });

  if (getStatusCode !== 200) {
    return response.status(getStatusCode).json(orderDetails);
  }

  // 2. Store the buyer's authorization (consent) record for NACHA compliance.
  // The ACH debit details live under payment_source.bank.ach_debit, which the
  // server SDK's PaymentSourceResponse type does not model, so we read it
  // defensively.
  const achDebit = (
    orderDetails.paymentSource as
      | {
          bank?: {
            achDebit?: {
              bankName?: string;
              lastDigits?: string;
              accountHolderName?: string;
            };
          };
        }
      | undefined
  )?.bank?.achDebit;
  await storeConsent({
    orderId,
    bankName: achDebit?.bankName,
    lastDigits: achDebit?.lastDigits,
    accountHolderName: achDebit?.accountHolderName,
    amount: orderDetails.purchaseUnits?.[0]?.amount?.value,
    currencyCode: orderDetails.purchaseUnits?.[0]?.amount?.currencyCode,
    authorizedAt: new Date().toISOString(),
  });

  // 3. Capture the payment.
  const { result, statusCode } = await ordersController.captureOrder({
    id: orderId,
    prefer: "return=minimal",
    paypalRequestId: randomUUID(),
  });

  response.status(statusCode).json(result);
}
