import {
  CheckoutPaymentIntent,
  PaypalExperienceUserAction,
  PaypalPaymentTokenCustomerType,
  PaypalPaymentTokenUsageType,
  PaypalWalletContextShippingPreference,
  StoreInVaultInstruction,
  VaultInstructionAction,
} from "@paypal/paypal-server-sdk";

import { createOrder, createSetupToken } from "./paypalServerSdk";

type CreateOrderForOneTimePaymentOptions = {
  currencyCode: string;
  amountValue: string;
  paypalRequestId?: string;
};

export function createOrderForOneTimePayment(
  {
    currencyCode,
    amountValue,
    paypalRequestId,
  }: CreateOrderForOneTimePaymentOptions = {
    currencyCode: "USD",
    amountValue: "100.00",
  },
) {
  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        amount: {
          currencyCode,
          value: amountValue,
        },
      },
    ],
  };
  return createOrder({ orderRequestBody, paypalRequestId });
}

type CreateOrderForPayPalOneTimePaymentWithVaultOptions = {
  currencyCode: string;
  amountValue: string;
  returnUrl: string;
  cancelUrl: string;
  paypalRequestId?: string;
};

export async function createOrderForPayPalOneTimePaymentWithVault(
  {
    currencyCode,
    amountValue,
    returnUrl,
    cancelUrl,
    paypalRequestId,
  }: CreateOrderForPayPalOneTimePaymentWithVaultOptions = {
    currencyCode: "USD",
    amountValue: "100.00",
    returnUrl: "http://example.com",
    cancelUrl: "http://example.com",
  },
) {
  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        amount: {
          currencyCode,
          value: amountValue,
        },
      },
    ],
    paymentSource: {
      paypal: {
        attributes: {
          vault: {
            storeInVault: StoreInVaultInstruction.OnSuccess,
            usageType: PaypalPaymentTokenUsageType.Merchant,
            customerType: PaypalPaymentTokenCustomerType.Consumer,
          },
        },
        experienceContext: {
          returnUrl,
          cancelUrl,
          shippingPreference: PaypalWalletContextShippingPreference.NoShipping,
        },
      },
    },
  };
  return createOrder({ orderRequestBody, paypalRequestId });
}

type CreateOrderForPayPalOneTimePaymentWithRedirectOptions = {
  currencyCode: string;
  amountValue: string;
  returnUrl: string;
  cancelUrl: string;
  paypalRequestId?: string;
};

export function createOrderForPayPalOneTimePaymentWithRedirect(
  {
    currencyCode,
    amountValue,
    returnUrl,
    cancelUrl,
    paypalRequestId,
  }: CreateOrderForPayPalOneTimePaymentWithRedirectOptions = {
    currencyCode: "USD",
    amountValue: "100.00",
    returnUrl: "http://example.com",
    cancelUrl: "http://example.com",
  },
) {
  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        amount: {
          currencyCode,
          value: amountValue,
        },
      },
    ],
    paymentSource: {
      paypal: {
        experienceContext: {
          returnUrl,
          cancelUrl,
          userAction: PaypalExperienceUserAction.Continue,
          shippingPreference: PaypalWalletContextShippingPreference.NoShipping,
        },
      },
    },
  };
  return createOrder({ orderRequestBody, paypalRequestId });
}

type CreateSetupTokenForPayPalSavePaymentOptions = {
  returnUrl: string;
  cancelUrl: string;
  paypalRequestId?: string;
};

export function createSetupTokenForPayPalSavePayment(
  {
    returnUrl,
    cancelUrl,
    paypalRequestId,
  }: CreateSetupTokenForPayPalSavePaymentOptions = {
    returnUrl: "http://example.com",
    cancelUrl: "http://example.com",
  },
) {
  const defaultSetupTokenRequestBody = {
    paymentSource: {
      paypal: {
        experienceContext: {
          cancelUrl,
          returnUrl,
          vaultInstruction: VaultInstructionAction.OnPayerApproval,
        },
        usageType: PaypalPaymentTokenUsageType.Merchant,
      },
    },
  };

  return createSetupToken(defaultSetupTokenRequestBody, paypalRequestId);
}
