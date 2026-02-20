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

import { client, PAYPAL_BASE_URL } from "../paypalServerSdkClient";
import { getAllProducts, getProduct } from "../productCatalog";

const ordersController = new OrdersController(client);

const MoneySchema = z.object({
  currency_code: z.string(),
  value: z.string(),
});

const ClientOrderPayloadSchema = z.object({
  intent: z.string(),
  processing_instruction: z.string().optional(),
  purchase_units: z.array(
    z.object({
      reference_id: z.string().optional(),
      description: z.string().optional(),
      custom_id: z.string().optional(),
      soft_descriptor: z.string().optional(),
      amount: z.object({
        currency_code: z.string(),
        value: z.string(),
        breakdown: z
          .object({
            item_total: MoneySchema.optional(),
            tax_total: MoneySchema.optional(),
            shipping: MoneySchema.optional(),
            handling: MoneySchema.optional(),
            insurance: MoneySchema.optional(),
            shipping_discount: MoneySchema.optional(),
          })
          .optional(),
      }),
      payee: z
        .object({
          merchant_id: z.string().optional(),
        })
        .optional(),
      items: z
        .array(
          z.object({
            name: z.string(),
            quantity: z.string(),
            description: z.string().optional(),
            url: z.string().optional(),
            category: z.string().optional(),
            sku: z.string().optional(),
            unit_amount: MoneySchema,
            tax: MoneySchema.optional(),
          }),
        )
        .optional(),
      shipping: z
        .object({
          method: z.string().optional(),
        })
        .optional(),
    }),
  ),
});

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
  let orderRequestBody;

  if (request.body.purchase_units) {
    // Direct API call path for APM-specific payloads (e.g., Scalapay, PIX)
    // that require fields not fully supported by the SDK
    try {
      const parsed = ClientOrderPayloadSchema.parse(request.body);

      // console.log(
      //   "[createOrderForOneTimePayment] Orders payload sent to v2/checkout/orders:",
      //   JSON.stringify(parsed, null, 2),
      // );

      const token =
        await client.clientCredentialsAuthManager.fetchToken();

      const rawResponse = await fetch(
        `${PAYPAL_BASE_URL}/v2/checkout/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.accessToken}`,
            "PayPal-Request-Id": randomUUID(),
            Prefer: "return=minimal",
          },
          body: JSON.stringify(parsed),
        },
      );

      // Handle non-JSON responses
      const contentType = rawResponse.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await rawResponse.json();
        // console.log(
        //   "[createOrderForOneTimePayment] Response:",
        //   JSON.stringify(result, null, 2),
        // );
        return response.status(rawResponse.status).json(result);
      } else {
        const text = await rawResponse.text();
        console.error(
          "[createOrderForOneTimePayment] Non-JSON response:",
          text,
        );
        return response.status(rawResponse.status).send(text);
      }
    } catch (error) {
      console.error(
        "[createOrderForOneTimePayment] Error creating order:",
        error,
      );
      return response.status(500).json({
        error: "Failed to create order",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else {
    const { currencyCode, totalAmount, items } = OneTimePaymentSchema.parse(
      request.body,
    );
    orderRequestBody = {
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
  }

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