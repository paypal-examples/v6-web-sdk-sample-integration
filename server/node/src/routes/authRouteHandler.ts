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
 * Maps LPM (Local Payment Method) name to its environment variable name.
 * Each APM can have a dedicated sandbox application with its own credentials.
 * Falls back to the default PAYPAL_SANDBOX_CLIENT_ID when no LPM-specific credential is set.
 */
const LPM_CLIENT_ID_ENV_MAP: Record<string, string> = {
  mbway: "MBWAY_PAYPAL_SANDBOX_CLIENT_ID",
  twint: "TWINT_PAYPAL_SANDBOX_CLIENT_ID",
  bizum: "BIZUM_PAYPAL_SANDBOX_CLIENT_ID",
  oxxopay: "OXXOPAY_PAYPAL_SANDBOX_CLIENT_ID",
  boleto: "BOLETO_PAYPAL_SANDBOX_CLIENT_ID",
  swish: "SWISH_PAYPAL_SANDBOX_CLIENT_ID",
  payu: "PAYU_PAYPAL_SANDBOX_CLIENT_ID",
  verkkopankki: "VERKKOPANKKI_PAYPAL_SANDBOX_CLIENT_ID",
  alfamart: "ALFAMART_PAYPAL_SANDBOX_CLIENT_ID",
  wero: "WERO_PAYPAL_SANDBOX_CLIENT_ID",
  doku: "DOKU_PAYPAL_SANDBOX_CLIENT_ID",
  indomaret: "INDOMARET_PAYPAL_SANDBOX_CLIENT_ID",
  indonesia_banks: "INDONESIA_BANKS_PAYPAL_SANDBOX_CLIENT_ID",
  jeniuspay: "JENIUSPAY_PAYPAL_SANDBOX_CLIENT_ID",
  kredivo: "KREDIVO_PAYPAL_SANDBOX_CLIENT_ID",
  linkaja: "LINKAJA_PAYPAL_SANDBOX_CLIENT_ID",
  ovo: "OVO_PAYPAL_SANDBOX_CLIENT_ID",
  paysafecard: "PAYSAFECARD_PAYPAL_SANDBOX_CLIENT_ID",
  skrill: "SKRILL_PAYPAL_SANDBOX_CLIENT_ID",
  thailand_banks: "THAILAND_BANKS_PAYPAL_SANDBOX_CLIENT_ID",
  blik: "BLIK_PAYPAL_SANDBOX_CLIENT_ID",
  dragonpay: "DRAGONPAY_PAYPAL_SANDBOX_CLIENT_ID",
  scalapay: "SCALAPAY_PAYPAL_SANDBOX_CLIENT_ID",
  estonia_banks: "ESTONIA_BANKS_PAYPAL_SANDBOX_CLIENT_ID",
  floa: "FLOA_PAYPAL_SANDBOX_CLIENT_ID",
  gopay: "GOPAY_PAYPAL_SANDBOX_CLIENT_ID",
  latvia_banks: "LATVIA_BANKS_PAYPAL_SANDBOX_CLIENT_ID",
  lithuania_banks: "LITHUANIA_BANKS_PAYPAL_SANDBOX_CLIENT_ID",
  paysera: "PAYSERA_PAYPAL_SANDBOX_CLIENT_ID",
  pix_international: "PIX_INTERNATIONAL_PAYPAL_SANDBOX_CLIENT_ID",
};

/*
 * Returns the PayPal Client ID for a specific LPM (Local Payment Method).
 * Each LPM can have a dedicated sandbox application credential configured via
 * per-LPM environment variables (e.g. MBWAY_PAYPAL_SANDBOX_CLIENT_ID).
 * Falls back to the default PAYPAL_SANDBOX_CLIENT_ID when not configured.
 */
export function lpmClientIdRouteHandler(request: Request, response: Response) {
  const lpmName = String(request.params.lpmName ?? "").toLowerCase() || undefined;

  if (!lpmName) {
    response.status(400).json({ error: "LPM name is required" });
    return;
  }

  const environmentVariableName = Object.prototype.hasOwnProperty.call(
    LPM_CLIENT_ID_ENV_MAP,
    lpmName,
  )
    ? LPM_CLIENT_ID_ENV_MAP[lpmName]
    : undefined;
  const lpmClientId = environmentVariableName ? process.env[environmentVariableName] : undefined;
  const clientId = lpmClientId || process.env.PAYPAL_SANDBOX_CLIENT_ID;

  if (!clientId) {
    throw new Error(
      "PAYPAL_SANDBOX_CLIENT_ID environment variable is not defined",
    );
  }

  response.status(200).json({ clientId });
}
