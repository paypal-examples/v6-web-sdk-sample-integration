import { OAuthAuthorizationController } from "@paypal/paypal-server-sdk";
import type { Request, Response } from "express";

import { client } from "../paypalServerSdk";

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
    ...(DOMAINS ? { "domains[]": DOMAINS } : {}),
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
