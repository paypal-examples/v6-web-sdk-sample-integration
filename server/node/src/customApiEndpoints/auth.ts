const { PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_SANDBOX_CLIENT_SECRET } = process.env;

const BASE_URL = "https://api-m.sandbox.paypal.com";

export async function getFullScopeAccessToken() {
  try {
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

    const { access_token } = (await response.json()) as {
      access_token: string;
    };
    return access_token;
  } catch (error) {
    console.error("Failed to create full scope access token:", error);
    throw error;
  }
}
