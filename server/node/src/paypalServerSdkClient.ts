import { Client, Environment, LogLevel } from "@paypal/paypal-server-sdk";

const { LOG_LEVEL } = process.env;

const { logLevel, logBody, logHeaders } = getLoggingConfig(LOG_LEVEL);

export const client = new Client({
  clientCredentialsAuthCredentials: getAuthCredentials(),
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel,
    logRequest: {
      logBody,
    },
    logResponse: {
      logHeaders,
    },
  },
});

// with an access token, the client ID comes from PAYPAL_CLIENT_ID, which
// `paypal dev` sets to the app that issued the token
export function getClientId() {
  const { env } = process;
  return (
    (env.PAYPAL_ACCESS_TOKEN && env.PAYPAL_CLIENT_ID) ||
    env.PAYPAL_SANDBOX_CLIENT_ID
  );
}

export function getAuthCredentials() {
  const { PAYPAL_SANDBOX_CLIENT_SECRET, PAYPAL_ACCESS_TOKEN } = process.env;
  const oAuthClientId = getClientId();

  // an access token, when set (e.g. by `paypal dev`), replaces the client secret
  if (oAuthClientId && PAYPAL_ACCESS_TOKEN) {
    return {
      oAuthClientId,
      oAuthClientSecret: "",
      oAuthTokenProvider: async () => ({
        accessToken: PAYPAL_ACCESS_TOKEN,
        tokenType: "Bearer",
      }),
    };
  }

  if (oAuthClientId && PAYPAL_SANDBOX_CLIENT_SECRET) {
    return { oAuthClientId, oAuthClientSecret: PAYPAL_SANDBOX_CLIENT_SECRET };
  }

  throw new Error("Missing API credentials");
}

function getLoggingConfig(logLevel?: string) {
  switch (logLevel) {
    case "error": {
      return {
        logLevel: LogLevel.Error,
        logBody: false,
        logHeaders: false,
      };
    }
    case "warn": {
      return {
        logLevel: LogLevel.Warn,
        logBody: false,
        logHeaders: false,
      };
    }
    case "info": {
      return {
        logLevel: LogLevel.Info,
        logBody: true,
        logHeaders: true,
      };
    }
    case "debug": {
      return {
        logLevel: LogLevel.Debug,
        logBody: true,
        logHeaders: true,
      };
    }
    case "trace": {
      return {
        logLevel: LogLevel.Trace,
        logBody: true,
        logHeaders: true,
      };
    }
    default: {
      return {
        logLevel: LogLevel.Info,
        logBody: true,
        logHeaders: true,
      };
    }
  }
}
