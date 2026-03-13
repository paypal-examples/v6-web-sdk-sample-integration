import { Client, Environment, LogLevel } from "@paypal/paypal-server-sdk";

const { PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_SANDBOX_CLIENT_SECRET } = process.env;

if (!PAYPAL_SANDBOX_CLIENT_ID || !PAYPAL_SANDBOX_CLIENT_SECRET) {
  throw new Error(
    "Missing PayPal credentials: PAYPAL_SANDBOX_CLIENT_ID and PAYPAL_SANDBOX_CLIENT_SECRET must be set"
  );
}

export const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_SANDBOX_CLIENT_ID,
    oAuthClientSecret: PAYPAL_SANDBOX_CLIENT_SECRET,
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: {
      logBody: true,
    },
    logResponse: {
      logHeaders: true,
    },
  },
});

export { PAYPAL_SANDBOX_CLIENT_ID };
