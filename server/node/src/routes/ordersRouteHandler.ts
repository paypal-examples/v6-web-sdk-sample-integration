import {
  CheckoutPaymentIntent,
  OrdersController,
  PaypalExperienceUserAction,
  PaypalPaymentTokenCustomerType,
  PaypalPaymentTokenUsageType,
  PaypalWalletContextShippingPreference,
  StoreInVaultInstruction,
} from "@paypal/paypal-server-sdk";
import { z } from "zod/v4";
import { randomUUID } from "crypto";
import type { Request, Response } from "express";

import { client } from "../paypalServerSdk";
import { getAllProducts, getProductPrice } from "../productCatalog";

const ordersController = new OrdersController(client);

const OneTimePaymentSchema = z.object({
  cart: z
    .array(
      z.object({
        sku: z.enum(getAllProducts().map(({ sku }) => sku)),
        quantity: z.number().int().positive().min(1).max(10),
      }),
    )
    .default([{ sku: getAllProducts()[0].sku, quantity: 2 }]),
  currencyCode: z.string().length(3).default("USD"),
});

function calculateCartAmount(cart: { sku: string; quantity: number }[]) {
  const calculatedTotal = cart.reduce((sum: number, item) => {
    const price = getProductPrice(item.sku);
    if (!price) {
      throw new Error(`Product with SKU ${item.sku} not found`);
    }
    return sum + parseFloat(price) * item.quantity;
  }, 0);

  return calculatedTotal.toFixed(2);
}

export async function createOrderForOneTimePaymentRouteHandler(
  request: Request,
  response: Response,
) {
  const { currencyCode, amountValue } = OneTimePaymentSchema.transform(
    (data) => {
      return {
        ...data,
        amountValue: calculateCartAmount(data.cart),
      };
    },
  ).parse(request.body);

  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        amount: {
          currencyCode,
          value: amountValue,
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

export async function createOrderForPayPalOneTimePaymentRouteHandler(
  request: Request,
  response: Response,
) {
  const PayPalOneTimePaymentSchema = OneTimePaymentSchema.extend({
    returnUrl: z.url().default(() => {
      return request.get("referer") ?? "https://www.example.com/success";
    }),
    cancelUrl: z.url().default(() => {
      return request.get("referer") ?? "https://www.example.com/cancel";
    }),
  });

  const { currencyCode, amountValue, returnUrl, cancelUrl } =
    PayPalOneTimePaymentSchema.transform((data) => {
      return {
        ...data,
        amountValue: calculateCartAmount(data.cart),
      };
    }).parse(request.body);

  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        amount: {
          currencyCode,
          value: amountValue,
        },
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
  const PayPalOneTimePaymentSchema = OneTimePaymentSchema.extend({
    returnUrl: z.url().default(() => {
      return request.get("referer") ?? "https://www.example.com/success";
    }),
    cancelUrl: z.url().default(() => {
      return request.get("referer") ?? "https://www.example.com/cancel";
    }),
  });

  const { currencyCode, amountValue, returnUrl, cancelUrl } =
    PayPalOneTimePaymentSchema.transform((data) => {
      return {
        ...data,
        amountValue: calculateCartAmount(data.cart),
      };
    }).parse(request.body);

  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        amount: {
          currencyCode,
          value: amountValue,
        },
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
