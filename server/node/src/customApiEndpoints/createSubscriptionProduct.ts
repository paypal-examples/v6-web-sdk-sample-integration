import { BASE_URL, CustomApiError, getFullScopeAccessToken } from "./utils";

type CreateSubscriptionProductOptions = {
  name: string;
  description: string;
  type: string;
  category: string;
};

type CreateSubscriptionProductSuccessResponse = {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
};

type CreateSubscriptionProductErrorResponse = {
  name: string;
  message: string;
  debug_id: string;
};

export async function createSubscriptionProduct(
  productDetails: CreateSubscriptionProductOptions,
) {
  const accessToken = await getFullScopeAccessToken();

  const response = await fetch(`${BASE_URL}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(productDetails),
  });

  const jsonResponse = await response.json();

  if (!response.ok) {
    const { message } = jsonResponse as CreateSubscriptionProductErrorResponse;
    throw new CustomApiError({
      message: message,
      statusCode: response.status,
      jsonResponse,
    });
  }

  return jsonResponse as CreateSubscriptionProductSuccessResponse;
}
