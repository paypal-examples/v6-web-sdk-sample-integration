import { CustomApiError } from "./customApiError";
import { BASE_URL } from "./constants";

type AuthTokenSuccessResponse = {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce: string;
};

type AuthTokenErrorResponse = {
  error: string;
  error_description: string;
};

export async function getFullScopeAccessToken() {
  const {
    PAYPAL_SANDBOX_CLIENT_ID,
    PAYPAL_SANDBOX_CLIENT_SECRET,
    PAYPAL_ACCESS_TOKEN,
  } = process.env;

  // `paypal dev` injects a ready access token instead of the client secret
  if (PAYPAL_ACCESS_TOKEN) {
    return PAYPAL_ACCESS_TOKEN;
  }

  const encodedClientCredentials = Buffer.from(
    `${PAYPAL_SANDBOX_CLIENT_ID}:${PAYPAL_SANDBOX_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept-Language": "en_US",
      Authorization: `Basic ${encodedClientCredentials}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const { error_description } = result as AuthTokenErrorResponse;
    throw new CustomApiError({
      message: error_description || "Failed to create full scope access token",
      statusCode: response.status,
      result,
    });
  }

  const { access_token } = result as AuthTokenSuccessResponse;
  return access_token;
}
