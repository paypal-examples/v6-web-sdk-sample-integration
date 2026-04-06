import { Client, Environment, LogLevel } from "@paypal/paypal-server-sdk";

const { PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_SANDBOX_CLIENT_SECRET, LOG_LEVEL } =
  process.env;

if (!PAYPAL_SANDBOX_CLIENT_ID || !PAYPAL_SANDBOX_CLIENT_SECRET) {
  throw new Error("Missing API credentials");
}

const { logLevel, logBody, logHeaders } = getLoggingConfiguration(LOG_LEVEL);

export const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_SANDBOX_CLIENT_ID,
    oAuthClientSecret: PAYPAL_SANDBOX_CLIENT_SECRET,
  },
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

function getLoggingConfiguration(logLevel?: string) {
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
