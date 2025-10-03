import { config } from "dotenv";
import { join } from "path";

const envFilePath = join(__dirname, "../../../", ".env");
config({ path: envFilePath });

const { PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_SANDBOX_CLIENT_SECRET } = process.env;

async function getFullScopeAccessToken() {
  try {
    const encodedClientCredentials = Buffer.from(
      `${PAYPAL_SANDBOX_CLIENT_ID}:${PAYPAL_SANDBOX_CLIENT_SECRET}`,
    ).toString("base64");

    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept-Language": "en_US",
          Authorization: `Basic ${encodedClientCredentials}`,
        },
      },
    );

    return await response.json();
  } catch (err) {
    throw err;
  }
}

export type FindEligibleMethodsOptions = {
  body: Record<string, unknown>;
};

export async function findEligibleMethods({
  body,
}: FindEligibleMethodsOptions) {
  try {
    const { access_token: accessToken } = await getFullScopeAccessToken();

    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v2/payments/find-eligible-methods",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": "en_US",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return await response.json();
  } catch (err) {
    throw err;
  }
}
