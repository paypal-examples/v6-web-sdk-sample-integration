import {
  PaymentTokenResponse,
  PaypalPaymentTokenUsageType,
  VaultController,
  VaultCardVerificationMethod,
  VaultInstructionAction,
  VaultTokenRequestType,
} from "@paypal/paypal-server-sdk";
import { z } from "zod/v4";
import { randomUUID } from "crypto";
import type { Request, Response } from "express";

import { client } from "../paypalServerSdkClient";

const vaultController = new VaultController(client);

export async function createSetupTokenForPayPalSavePaymentRouteHandler(
  request: Request,
  response: Response,
) {
  const setupTokenRequestBody = {
    paymentSource: {
      paypal: {
        experienceContext: {
          cancelUrl: request.get("referer") ?? "https://www.example.com/cancel",
          returnUrl:
            request.get("referer") ?? "https://www.example.com/success",
          vaultInstruction: VaultInstructionAction.OnPayerApproval,
        },
        usageType: PaypalPaymentTokenUsageType.Merchant,
      },
    },
  };

  const { result, statusCode } = await vaultController.createSetupToken({
    body: setupTokenRequestBody,
    paypalRequestId: randomUUID(),
  });

  response.status(statusCode).json(result);
}

export async function createSetupTokenForCardSavePaymentRouteHandler(
  request: Request,
  response: Response,
) {
  const setupTokenRequestBody = {
    paymentSource: {
      card: {
        experienceContext: {
          cancelUrl: request.get("referer") ?? "https://www.example.com/cancel",
          returnUrl:
            request.get("referer") ?? "https://www.example.com/success",
        },
        verificationMethod: VaultCardVerificationMethod.ScaWhenRequired,
        usageType: PaypalPaymentTokenUsageType.Merchant,
      },
    },
  };

  const { result, statusCode } = await vaultController.createSetupToken({
    body: setupTokenRequestBody,
    paypalRequestId: randomUUID(),
  });

  response.status(statusCode).json(result);
}

export async function createPaymentTokenRouteHandler(
  request: Request,
  response: Response,
) {
  const { vaultSetupToken } = z
    .object({
      vaultSetupToken: z.string(),
    })
    .parse(request.body);

  const { result, statusCode } = await vaultController.createPaymentToken({
    paypalRequestId: randomUUID(),
    body: {
      paymentSource: {
        token: {
          id: vaultSetupToken,
          type: VaultTokenRequestType.SetupToken,
        },
      },
    },
  });

  if (result.id) {
    // This payment token id is a long-lived value for making
    // future payments when the buyer is not present.
    // PayPal recommends storing this value in your database
    // and NOT returning it back to the browser.
    await savePaymentTokenToDatabase(result);
    response.status(statusCode).json({
      status: "SUCCESS",
      description: "Payment token saved to database for future transactions",
    });
  } else {
    response.status(statusCode).json({
      status: "ERROR",
      description: "Failed to create payment token",
    });
  }
}

// example function to teach saving the paymentTokenResponse to a database
async function savePaymentTokenToDatabase(
  paymentTokenResponse: PaymentTokenResponse,
) {
  const storeInCustomerTable = (_options: {
    paymentToken: string;
    paypalCustomerId: string;
  }) => {};

  // store the payment token for future transactions
  // store the customer id for two things:
  // 1. CRUD operations with the Payment Method Tokens API
  // 2. Displaying the return buyer experience with the PayPal Web SDK
  storeInCustomerTable({
    paymentToken: paymentTokenResponse.id!,
    paypalCustomerId: paymentTokenResponse.customer?.id!,
  });

  return Promise.resolve();
}
