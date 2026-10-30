import { OAuthAuthorizationController } from "@paypal/paypal-server-sdk";
import type { Request, Response } from "express";

import { client, getClientId } from "../paypalServerSdkClient";

const oAuthAuthorizationController = new OAuthAuthorizationController(client);

export async function clientTokenRouteHandler(
  request: Request,
  response: Response,
) {
  const { DOMAINS, PAYPAL_SANDBOX_CLIENT_SECRET } = process.env;

  // a client token can't be created with an access token alone
  if (!PAYPAL_SANDBOX_CLIENT_SECRET) {
    throw new Error(
      "PAYPAL_SANDBOX_CLIENT_SECRET environment variable is not defined; Card Fields, Fastlane and saved payment methods need it",
    );
  }

  const auth = Buffer.from(
    `${getClientId()}:${PAYPAL_SANDBOX_CLIENT_SECRET}`,
  ).toString("base64");

  const { targetCustomerId, vaultId } = request.query;
  let claimKey = "vault_id";
  if (vaultId && typeof vaultId === "string" && vaultId.startsWith("B-")) {
    claimKey = "billing_agreement_id";
  }

  const fieldParameters = {
    response_type: "client_token",
    // the Fastlane component requires this domains[] parameter
    ...(DOMAINS && { "domains[]": DOMAINS }),
    // Saved Payment Methods requires either vaultId or targetCustomerId
    ...(targetCustomerId && typeof targetCustomerId === "string"
      ? { target_customer_id: targetCustomerId }
      : {}),
    ...(vaultId && typeof vaultId === "string"
      ? { "claims[]": `${claimKey}:${vaultId}` }
      : {}),
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
  const clientId = getClientId();

  if (!clientId) {
    throw new Error("No client ID is set");
  }
  response.status(200).json({ clientId });
}
