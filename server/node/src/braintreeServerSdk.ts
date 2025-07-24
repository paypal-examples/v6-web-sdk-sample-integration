import { config } from "dotenv";
import { join } from "path";

const envFilePath = join(__dirname, "../../../", ".env");
config({ path: envFilePath });

import braintree from "braintree";

/* ######################################################################
 * Set up Braintree gateway
 * ###################################################################### */

const {
  BRAINTREE_SANDBOX_MERCHANT_ID,
  BRAINTREE_SANDBOX_MERCHANT_PUBLIC_KEY,
  BRAINTREE_SANDBOX_MERCHANT_PRIVATE_KEY,
} = process.env;

let gateway: braintree.BraintreeGateway | undefined;

function getGateway(): braintree.BraintreeGateway {
  if (
    !BRAINTREE_SANDBOX_MERCHANT_ID ||
    !BRAINTREE_SANDBOX_MERCHANT_PUBLIC_KEY ||
    !BRAINTREE_SANDBOX_MERCHANT_PRIVATE_KEY
  ) {
    throw new Error("Missing Braintree API credentials");
  }

  if (gateway === undefined) {
    gateway = new braintree.BraintreeGateway({
      environment: braintree.Environment.Sandbox,
      merchantId: BRAINTREE_SANDBOX_MERCHANT_ID,
      privateKey: BRAINTREE_SANDBOX_MERCHANT_PRIVATE_KEY,
      publicKey: BRAINTREE_SANDBOX_MERCHANT_PUBLIC_KEY,
    });
  }
  return gateway;
}

/* ######################################################################
 * Braintree helper functions
 * ###################################################################### */

export async function getBraintreeBrowserSafeClientToken() {
  try {
    const clientTokenResponse = await getGateway().clientToken.generate({});

    return {
      jsonResponse: { accessToken: clientTokenResponse.clientToken },
      httpStatusCode: 200,
    };
  } catch (error) {
    console.error("Failed to create Braintree client token:", error);
    throw error;
  }
}

export async function completeTransactionSale({
  paymentMethodNonce,
  amount,
}: {
  paymentMethodNonce: string;
  amount: string | number;
}) {
  try {
    const result = await getGateway().transaction.sale({
      amount: amount.toString(),
      paymentMethodNonce,
    });

    const httpStatusCode = result.success ? 200 : 500;

    return {
      jsonResponse: result,
      httpStatusCode,
    };
  } catch (error) {
    console.error("Failed to complete Braintree transaction:", error);
    throw error;
  }
}
