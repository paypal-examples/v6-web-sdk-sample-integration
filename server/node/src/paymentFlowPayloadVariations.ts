import { randomUUID } from "crypto";

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

const defaultOptions = {
  currencyCode: "USD",
  amountValue: "100.00",
  returnUrl: "http://example.com",
  cancelUrl: "http://example.com",
  paypalRequestId: randomUUID(),
};

type CreateOrderForOneTimePaymentOptions = {
  currencyCode?: string;
  amountValue?: string;
  paypalRequestId?: string;
};

export function createOrderForOneTimePayment({
  currencyCode = defaultOptions.currencyCode,
  amountValue = defaultOptions.amountValue,
  paypalRequestId = defaultOptions.paypalRequestId,
}: CreateOrderForOneTimePaymentOptions = defaultOptions) {
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
  currencyCode?: string;
  amountValue?: string;
  returnUrl?: string;
  cancelUrl?: string;
  paypalRequestId?: string;
};

export async function createOrderForPayPalOneTimePaymentWithVault({
  currencyCode = defaultOptions.currencyCode,
  amountValue = defaultOptions.amountValue,
  paypalRequestId = defaultOptions.paypalRequestId,
  returnUrl = defaultOptions.returnUrl,
  cancelUrl = defaultOptions.cancelUrl,
}: CreateOrderForPayPalOneTimePaymentWithVaultOptions = defaultOptions) {
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
  currencyCode?: string;
  amountValue?: string;
  returnUrl?: string;
  cancelUrl?: string;
  paypalRequestId?: string;
};

export function createOrderForPayPalOneTimePaymentWithRedirect({
  currencyCode = defaultOptions.currencyCode,
  amountValue = defaultOptions.amountValue,
  paypalRequestId = defaultOptions.paypalRequestId,
  returnUrl = defaultOptions.returnUrl,
  cancelUrl = defaultOptions.cancelUrl,
}: CreateOrderForPayPalOneTimePaymentWithRedirectOptions = defaultOptions) {
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
  returnUrl?: string;
  cancelUrl?: string;
  paypalRequestId?: string;
};

export function createSetupTokenForPayPalSavePayment(
  {
    returnUrl = defaultOptions.returnUrl,
    cancelUrl = defaultOptions.cancelUrl,
    paypalRequestId = defaultOptions.paypalRequestId,
  }: CreateSetupTokenForPayPalSavePaymentOptions = {
    returnUrl: defaultOptions.returnUrl,
    cancelUrl: defaultOptions.cancelUrl,
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
