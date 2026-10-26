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
  const { PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_ACCESS_TOKEN } = process.env;

  // read apart from the destructuring above: `paypal init` renames the sandbox
  // variable to PAYPAL_CLIENT_ID, which would declare it twice
  return PAYPAL_ACCESS_TOKEN
    ? process.env.PAYPAL_CLIENT_ID || PAYPAL_SANDBOX_CLIENT_ID
    : PAYPAL_SANDBOX_CLIENT_ID;
}

export function getAuthCredentials() {
  const { PAYPAL_SANDBOX_CLIENT_SECRET, PAYPAL_ACCESS_TOKEN } = process.env;
  const clientId = getClientId();

  // an access token, when set (e.g. by `paypal dev`), is used instead of the
  // client secret
  if (clientId && PAYPAL_ACCESS_TOKEN) {
    return {
      oAuthClientId: clientId,
      oAuthClientSecret: "",
      oAuthTokenProvider: async () => ({
        accessToken: PAYPAL_ACCESS_TOKEN,
        tokenType: "Bearer",
      }),
    };
  }

  if (clientId && PAYPAL_SANDBOX_CLIENT_SECRET) {
    return {
      oAuthClientId: clientId,
      oAuthClientSecret: PAYPAL_SANDBOX_CLIENT_SECRET,
    };
  }

  throw new Error(
    PAYPAL_ACCESS_TOKEN
      ? "PAYPAL_ACCESS_TOKEN is set, but PAYPAL_CLIENT_ID isn't"
      : "Missing API credentials: set PAYPAL_SANDBOX_CLIENT_ID and PAYPAL_SANDBOX_CLIENT_SECRET, or run the server with `paypal dev`",
  );
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
