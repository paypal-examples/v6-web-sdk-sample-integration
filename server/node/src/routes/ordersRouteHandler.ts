import {
  CheckoutPaymentIntent,
  OrdersCardVerificationMethod,
  OrdersController,
  PaypalExperienceUserAction,
  PaypalPaymentTokenCustomerType,
  PaypalPaymentTokenUsageType,
  PaypalWalletContextShippingPreference,
  ShippingType,
  StoreInVaultInstruction,
} from "@paypal/paypal-server-sdk";
import { z } from "zod/v4";
import { randomUUID } from "crypto";
import type { Request, Response } from "express";

import { client } from "../paypalServerSdk";
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
    currencyCode: z.string().length(3).default("USD"),
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
    totalAmount += parseFloat(price) * quantity;
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
  const { currencyCode, totalAmount, items } = OneTimePaymentSchema.parse(
    request.body,
  );

  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
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
  const { currencyCode, totalAmount, items, returnUrl, cancelUrl } =
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
    }).parse(request.body);

  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
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
  const { currencyCode, totalAmount, items, returnUrl, cancelUrl } =
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
    }).parse(request.body);

  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
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

export async function createOrderForOneTimePaymentWithShippingRouteHandler(
  request: Request,
  response: Response,
) {
  const { currencyCode, totalAmount, items } = OneTimePaymentSchema.parse(
    request.body,
  );

  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
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
              id: "SHIP_UNV",
              label: "Unavailable",
              type: ShippingType.Shipping,
              selected: false,
              amount: {
                value: "1000",
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

  const { currencyCode, totalAmount, items } = OneTimePaymentSchema.parse(
    request.body,
  );

  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
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
  const { currencyCode, totalAmount, items, returnUrl, cancelUrl } =
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
    }).parse(request.body);

  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
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
