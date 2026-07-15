import { z } from "zod/v4";
import type { Request, Response } from "express";

import { createOrder } from "../customApiEndpoints/createOrder";
import { getAllProducts, getProduct } from "../productCatalog";

const CreateOrderForRedirectSchema = z
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
    shippingCost: z
      .string()
      .regex(/^\d+\.\d{2}$/, "must be a decimal string with 2 decimal places")
      .optional(),
    returnUrl: z.url(),
    cancelUrl: z.url(),
  })
  .transform((data) => {
    const { items, itemTotal } = calculateCartAmount(
      data.cart,
      data.currencyCode,
    );
    const totalAmount = (
      Number(itemTotal) + Number(data.shippingCost ?? "0")
    ).toFixed(2);

    return {
      ...data,
      itemTotal,
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
  let itemTotal = 0;

  for (const { sku, quantity } of cart) {
    const { name, price } = getProduct(sku);
    itemTotal += Number(price) * quantity;
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
    itemTotal: itemTotal.toFixed(2),
    items,
  };
}

export async function createOrderForPayPalOneTimePaymentWithRedirectRestRouteHandler(
  request: Request,
  response: Response,
) {
  const refererUrl = request.get("referer");

  const {
    currencyCode,
    totalAmount,
    itemTotal,
    shippingCost,
    items,
    returnUrl,
    cancelUrl,
  } = CreateOrderForRedirectSchema.parse({
    ...request.body,
    returnUrl:
      request.body?.returnUrl ??
      refererUrl ??
      "https://www.example.com/success",
    cancelUrl:
      request.body?.cancelUrl ?? refererUrl ?? "https://www.example.com/cancel",
  });

  const result = await createOrder({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: currencyCode,
          value: totalAmount,
          breakdown: {
            item_total: {
              currency_code: currencyCode,
              value: itemTotal,
            },
            ...(shippingCost && {
              shipping: {
                currency_code: currencyCode,
                value: shippingCost,
              },
            }),
          },
        },
        items: items.map(({ sku, name, quantity, unitAmount }) => ({
          sku,
          name,
          quantity,
          unit_amount: {
            currency_code: unitAmount.currencyCode,
            value: unitAmount.value,
          },
        })),
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      },
    },
  });

  response.status(201).json(result);
}
