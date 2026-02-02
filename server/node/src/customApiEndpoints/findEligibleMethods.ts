import { getFullScopeAccessToken } from "./auth";

const BASE_URL = "https://api-m.sandbox.paypal.com";

export type FindEligibleMethodsOptions = {
  purchase_units: Record<string, unknown>[];
};

export async function findEligibleMethods(payload: FindEligibleMethodsOptions) {
  try {
    const accessToken = await getFullScopeAccessToken();

    const response = await fetch(
      `${BASE_URL}/v2/payments/find-eligible-methods`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": "en_US",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const jsonResponse = await response.json();

    return {
      jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (error) {
    return {
      jsonResponse: (error as Error).toString(),
      httpStatusCode: 500,
    };
  }
}
