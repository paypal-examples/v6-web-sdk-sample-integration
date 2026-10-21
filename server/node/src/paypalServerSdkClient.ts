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

export function getAuthCredentials() {
  const {
    PAYPAL_SANDBOX_CLIENT_ID,
    PAYPAL_SANDBOX_CLIENT_SECRET,
    PAYPAL_ACCESS_TOKEN,
  } = process.env;

  // an access token, when set (e.g. by `paypal dev`), is used instead of the
  // client secret
  if (PAYPAL_SANDBOX_CLIENT_ID && PAYPAL_ACCESS_TOKEN) {
    return {
      oAuthClientId: PAYPAL_SANDBOX_CLIENT_ID,
      oAuthClientSecret: "",
      oAuthTokenProvider: async () => ({
        accessToken: PAYPAL_ACCESS_TOKEN,
        tokenType: "Bearer",
      }),
    };
  }

  if (PAYPAL_SANDBOX_CLIENT_ID && PAYPAL_SANDBOX_CLIENT_SECRET) {
    return {
      oAuthClientId: PAYPAL_SANDBOX_CLIENT_ID,
      oAuthClientSecret: PAYPAL_SANDBOX_CLIENT_SECRET,
    };
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
