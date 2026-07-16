import { randomUUID } from "node:crypto";

import { getFullScopeAccessToken } from "./authorization";
import { CustomApiError } from "./customApiError";
import { BASE_URL } from "./constants";

/*
 * Creates an order that forces 3D Secure (Strong Customer Authentication) for
 * Google Pay, analogous to how the card 3DS example forces it with
 * `payment_source.card.attributes.verification.method = SCA_ALWAYS`.
 *
 * This is a raw REST call rather than an `OrdersController.createOrder` call
 * because the typed `@paypal/paypal-server-sdk` (and PayPal's published OpenAPI
 * spec) does not model `payment_source.google_pay.attributes.verification`. The
 * SDK's generated schema silently discards unmodeled fields, so a body sent
 * through it would drop the `SCA_ALWAYS` instruction and 3DS would not be
 * forced. The Orders v2 API itself accepts the field, so we send it directly.
 */

type CreateOrderForGooglePayWithThreeDSecureOptions = {
  intent: string;
  currencyCode: string;
  value: string;
};

type CreateOrderErrorResponse = {
  name: string;
  message: string;
  debug_id: string;
};

export async function createOrderForGooglePayWithThreeDSecure({
  intent,
  currencyCode,
  value,
}: CreateOrderForGooglePayWithThreeDSecureOptions) {
  const accessToken = await getFullScopeAccessToken();

  const body = {
    intent,
    purchase_units: [
      {
        amount: {
          currency_code: currencyCode,
          value,
          breakdown: {
            item_total: {
              currency_code: currencyCode,
              value,
            },
          },
        },
      },
    ],
    payment_source: {
      google_pay: {
        attributes: {
          verification: {
            // use "SCA_ALWAYS" to force 3D Secure on every transaction
            // https://developer.paypal.com/docs/checkout/advanced/customize/3d-secure/test/
            method: "SCA_ALWAYS",
          },
        },
      },
    },
  };

  const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "en_US",
      Authorization: `Bearer ${accessToken}`,
      "PayPal-Request-Id": randomUUID(),
      Prefer: "return=minimal",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const { message } = result as CreateOrderErrorResponse;
    throw new CustomApiError({
      message: message || "Failed to create order",
      statusCode: response.status,
      result,
    });
  }

  return { statusCode: response.status, result };
}
