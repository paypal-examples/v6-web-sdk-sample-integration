const { PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_SANDBOX_CLIENT_SECRET } = process.env;

export const BASE_URL = "https://api-m.sandbox.paypal.com";

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

  const jsonResponse = await response.json();

  if (!response.ok) {
    const { error_description } = jsonResponse as AuthTokenErrorResponse;
    throw new CustomApiError({
      message: error_description || "Failed to create full scope access token",
      statusCode: response.status,
      jsonResponse,
    });
  }

  const { access_token } = jsonResponse as AuthTokenSuccessResponse;
  return access_token;
}

export class CustomApiError extends Error {
  statusCode: number;
  jsonResponse: Record<string, unknown>;

  constructor({
    message,
    statusCode,
    jsonResponse,
  }: {
    message: string;
    statusCode: number;
    jsonResponse: Record<string, unknown>;
  }) {
    super(message);
    this.statusCode = statusCode;
    this.jsonResponse = jsonResponse;
  }
}
