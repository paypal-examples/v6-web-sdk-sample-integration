import { getFullScopeAccessToken } from "./auth";

const BASE_URL = "https://api-m.sandbox.paypal.com";

type CreateSubscriptionProductOptions = {
  name: string;
  description: string;
  type: string;
  category: string;
};

export async function createSubscriptionProduct(
  productDetails: CreateSubscriptionProductOptions,
) {
  try {
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

    return {
      jsonResponse: jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (error) {
    return {
      jsonResponse: (error as Error).toString(),
      httpStatusCode: 500,
    };
  }
}
