import { OAuthAuthorizationController } from "@paypal/paypal-server-sdk";
import type { Request, Response } from "express";

import { client } from "../paypalServerSdkClient";

const { DOMAINS, PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_SANDBOX_CLIENT_SECRET } =
  process.env;

const oAuthAuthorizationController = new OAuthAuthorizationController(client);

export async function clientTokenRouteHandler(
  _request: Request,
  response: Response,
) {
  const auth = Buffer.from(
    `${PAYPAL_SANDBOX_CLIENT_ID}:${PAYPAL_SANDBOX_CLIENT_SECRET}`,
  ).toString("base64");

  const fieldParameters = {
    response_type: "client_token",
    // the Fastlane component requires this domains[] parameter
    ...(DOMAINS && { "domains[]": DOMAINS }),
  };

  const { result, statusCode } =
    await oAuthAuthorizationController.requestToken(
      {
        authorization: `Basic ${auth}`,
      },
      fieldParameters,
    );

  // the OAuthToken interface is too general
  // this interface is specific to the "client_token" response type
  interface ClientToken {
    accessToken: string;
    expiresIn: number;
    scope: string;
    tokenType: string;
  }

  const { accessToken, expiresIn, scope, tokenType } = result;
  const transformedResult: ClientToken = {
    accessToken,
    // convert BigInt value to a Number
    expiresIn: Number(expiresIn),
    scope: String(scope),
    tokenType,
  };

  response.status(statusCode).json(transformedResult);
}

/*
 * For convenience, this route returns the PayPal Client ID to the front-end.
 * This way the .env file can be the single source of truth for the Client ID.
 * It is safe for merchant developers to hardcode Client ID values in front-end JavaScript/HTML files.
 */
export function clientIdRouteHandler(_request: Request, response: Response) {
  const { PAYPAL_SANDBOX_CLIENT_ID } = process.env;

  if (!PAYPAL_SANDBOX_CLIENT_ID) {
    throw new Error(
      "PAYPAL_SANDBOX_CLIENT_ID environment variable is not defined",
    );
  }
  response.status(200).json({ clientId: PAYPAL_SANDBOX_CLIENT_ID });
}

/*
 * Maps LPM registry key (camelCase) to its environment variable name.
 * Each APM can have a dedicated sandbox application with its own credentials.
 * Falls back to the default PAYPAL_SANDBOX_CLIENT_ID when no LPM-specific credential is set.
 */
const LPM_ENV_MAP: Record<string, { clientId: string; clientSecret: string }> = {
  mbway: {
    clientId: "MBWAY_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "MBWAY_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  twint: {
    clientId: "TWINT_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "TWINT_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  bizum: {
    clientId: "BIZUM_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "BIZUM_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  oxxopay: {
    clientId: "OXXOPAY_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "OXXOPAY_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  boletobancario: {
    clientId: "BOLETO_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "BOLETO_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  swish: {
    clientId: "SWISH_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "SWISH_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  payu: {
    clientId: "PAYU_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "PAYU_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  verkkopankki: {
    clientId: "VERKKOPANKKI_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "VERKKOPANKKI_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  alfamart: {
    clientId: "ALFAMART_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "ALFAMART_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  wero: {
    clientId: "WERO_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "WERO_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  doku: {
    clientId: "DOKU_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "DOKU_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  indomaret: {
    clientId: "INDOMARET_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "INDOMARET_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  indonesiaBanks: {
    clientId: "INDONESIA_BANKS_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "INDONESIA_BANKS_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  jeniuspay: {
    clientId: "JENIUSPAY_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "JENIUSPAY_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  kredivo: {
    clientId: "KREDIVO_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "KREDIVO_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  linkaja: {
    clientId: "LINKAJA_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "LINKAJA_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  ovo: {
    clientId: "OVO_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "OVO_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  paysafecard: {
    clientId: "PAYSAFECARD_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "PAYSAFECARD_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  skrill: {
    clientId: "SKRILL_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "SKRILL_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  thailandBanks: {
    clientId: "THAILAND_BANKS_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "THAILAND_BANKS_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  blik: {
    clientId: "BLIK_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "BLIK_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  dragonpay: {
    clientId: "DRAGONPAY_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "DRAGONPAY_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  scalapay: {
    clientId: "SCALAPAY_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "SCALAPAY_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  estonia: {
    clientId: "ESTONIA_BANKS_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "ESTONIA_BANKS_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  floa: {
    clientId: "FLOA_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "FLOA_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  gopay: {
    clientId: "GOPAY_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "GOPAY_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  latviaBanks: {
    clientId: "LATVIA_BANKS_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "LATVIA_BANKS_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  lithuaniaBanks: {
    clientId: "LITHUANIA_BANKS_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "LITHUANIA_BANKS_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  paysera: {
    clientId: "PAYSERA_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "PAYSERA_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
  pixInternational: {
    clientId: "PIX_INTERNATIONAL_PAYPAL_SANDBOX_CLIENT_ID",
    clientSecret: "PIX_INTERNATIONAL_PAYPAL_SANDBOX_CLIENT_SECRET",
  },
};

/*
 * Returns the PayPal credentials for a specific LPM (Local Payment Method).
 * Each LPM can have a dedicated sandbox application credential configured via
 * per-LPM environment variables (e.g. MBWAY_PAYPAL_SANDBOX_CLIENT_ID/SECRET).
 * Falls back to the default PAYPAL_SANDBOX_CLIENT_ID/SECRET when not configured.
 */
export function lpmClientIdRouteHandler(request: Request, response: Response) {
  const lpmName = String(request.params.lpmName ?? "").trim() || undefined;

  if (!lpmName) {
    response.status(400).json({ error: "LPM name is required" });
    return;
  }

  const environmentMap = Object.prototype.hasOwnProperty.call(
    LPM_ENV_MAP,
    lpmName,
  )
    ? LPM_ENV_MAP[lpmName]
    : undefined;

  const lpmClientId = environmentMap
    ? process.env[environmentMap.clientId]
    : undefined;
  const lpmClientSecret = environmentMap
    ? process.env[environmentMap.clientSecret]
    : undefined;

  const clientId = lpmClientId || process.env.PAYPAL_SANDBOX_CLIENT_ID;
  const clientSecret =
    lpmClientSecret || process.env.PAYPAL_SANDBOX_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "PAYPAL_SANDBOX_CLIENT_ID and PAYPAL_SANDBOX_CLIENT_SECRET environment variables are not defined",
    );
  }

  response.status(200).json({ clientId, clientSecret });
}
