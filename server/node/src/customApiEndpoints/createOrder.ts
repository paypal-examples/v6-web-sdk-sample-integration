import { randomUUID } from "node:crypto";

import { getFullScopeAccessToken } from "./authorization";
import { CustomApiError } from "./customApiError";
import { BASE_URL } from "./constants";

type CreateOrderSuccessResponse = {
  id: string;
  status: string;
  links: { href: string; rel: string; method: string }[];
};

type CreateOrderErrorResponse = {
  name: string;
  message: string;
  debug_id: string;
};

export async function createOrder(orderRequestBody: Record<string, unknown>) {
  const accessToken = await getFullScopeAccessToken();

  const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": randomUUID(),
    },
    body: JSON.stringify(orderRequestBody),
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

  return result as CreateOrderSuccessResponse;
}
