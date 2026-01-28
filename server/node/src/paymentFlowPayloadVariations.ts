import { randomUUID } from "crypto";

import {
  CheckoutPaymentIntent,
  IntervalUnit,
  OrdersCardVerificationMethod,
  PaypalExperienceUserAction,
  PaypalPaymentTokenCustomerType,
  PaypalPaymentTokenUsageType,
  PaypalWalletContextShippingPreference,
  PlanRequestStatus,
  StoreInVaultInstruction,
  TenureType,
  VaultInstructionAction,
  VaultCardVerificationMethod,
} from "@paypal/paypal-server-sdk";

import {
  createOrder,
  createSetupToken,
  createSubscriptionBillingPlan,
  createSubscriptionProduct,
} from "./paypalServerSdk";

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
  const setupTokenRequestBody = {
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

  return createSetupToken(setupTokenRequestBody, paypalRequestId);
}

type CreateSetupTokenForCardSavePaymentOptions = {
  returnUrl?: string;
  cancelUrl?: string;
  paypalRequestId?: string;
};

export function createSetupTokenForCardSavePayment(
  {
    returnUrl = defaultOptions.returnUrl,
    cancelUrl = defaultOptions.cancelUrl,
    paypalRequestId = defaultOptions.paypalRequestId,
  }: CreateSetupTokenForCardSavePaymentOptions = {
    returnUrl: defaultOptions.returnUrl,
    cancelUrl: defaultOptions.cancelUrl,
  },
) {
  const setupTokenRequestBody = {
    paymentSource: {
      card: {
        experienceContext: {
          cancelUrl,
          returnUrl,
        },
        verificationMethod: VaultCardVerificationMethod.ScaWhenRequired,
        usageType: PaypalPaymentTokenUsageType.Merchant,
      },
    },
  };

  return createSetupToken(setupTokenRequestBody, paypalRequestId);
}

type CreateMonthlySubscriptionBillingPlanOptions = {
  productId?: string;
  currencyCode?: string;
  amountValue?: string;
  paypalRequestId?: string;
};

export async function createMonthlySubscriptionBillingPlan(
  {
    productId,
    currencyCode = defaultOptions.currencyCode,
    amountValue = "9.99",
    paypalRequestId = defaultOptions.paypalRequestId,
  }: CreateMonthlySubscriptionBillingPlanOptions = {
    currencyCode: "USD",
    amountValue: "9.99",
    paypalRequestId: defaultOptions.paypalRequestId,
  },
) {
  if (!productId) {
    const { id } = await createSubscriptionProduct({
      name: "Sample Subscription Product",
      description: "Sample product for subscription testing",
      type: "SERVICE",
      category: "SOFTWARE",
    });

    productId = id;
  }

  const planRequestBody = {
    productId,
    name: "Sample Monthly Plan",
    description: `${amountValue}/month subscription`,
    status: PlanRequestStatus.Active,
    billingCycles: [
      {
        frequency: {
          intervalUnit: IntervalUnit.Month,
          intervalCount: 1,
        },
        tenureType: TenureType.Regular,
        sequence: 1,
        totalCycles: 0,
        pricingScheme: {
          fixedPrice: {
            currencyCode,
            value: amountValue,
          },
        },
      },
    ],
    paymentPreferences: {
      autoBillOutstanding: true,
      setupFee: {
        currencyCode: "USD",
        value: "0.00",
      },
      paymentFailureThreshold: 3,
    },
  };

  return createSubscriptionBillingPlan(planRequestBody, paypalRequestId);
}

type CreateOrderForFastlaneOptions = {
  paymentToken: string;
  currencyCode?: string;
  amountValue?: string;
  paypalRequestId?: string;
};

export function createOrderForFastlane({
  paymentToken,
  currencyCode = defaultOptions.currencyCode,
  amountValue = "10.00",
  paypalRequestId = defaultOptions.paypalRequestId,
}: CreateOrderForFastlaneOptions) {
  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        amount: {
          currencyCode,
          value: amountValue,
          breakdown: {
            itemTotal: {
              currencyCode,
              value: amountValue,
            },
          },
        },
      },
    ],
    paymentSource: {
      card: {
        singleUseToken: paymentToken,
      },
    },
  };
  return createOrder({ orderRequestBody, paypalRequestId });
}

type CreateOrderForCardOneTimePaymentWithThreeDSecureOptions = {
  currencyCode?: string;
  amountValue?: string;
  returnUrl?: string;
  cancelUrl?: string;
  paypalRequestId?: string;
};

export function createOrderForCardOneTimePaymentWithThreeDSecure({
  currencyCode = defaultOptions.currencyCode,
  amountValue = defaultOptions.amountValue,
  returnUrl = defaultOptions.returnUrl,
  cancelUrl = defaultOptions.cancelUrl,
  paypalRequestId = defaultOptions.paypalRequestId,
}: CreateOrderForCardOneTimePaymentWithThreeDSecureOptions = defaultOptions) {
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
      card: {
        attributes: {
          verification: {
            method: OrdersCardVerificationMethod.ScaAlways,
          },
        },
        experienceContext: {
          returnUrl,
          cancelUrl,
        },
      },
    },
  };
  return createOrder({ orderRequestBody, paypalRequestId });
}

type CreateOrderForPayPalGuestPaymentWithShippingOptions = {
  currencyCode?: string;
  amountValue?: string;
  paypalRequestId?: string;
};

export function createOrderForPayPalGuestPaymentWithShipping({
  currencyCode = defaultOptions.currencyCode,
  amountValue = "10.00",
  paypalRequestId = defaultOptions.paypalRequestId,
}: CreateOrderForPayPalGuestPaymentWithShippingOptions = defaultOptions) {
  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        amount: {
          currencyCode,
          value: amountValue,
          breakdown: {
            itemTotal: {
              currencyCode,
              value: amountValue,
            },
          },
        },
        shipping: {
          options: [
            {
              id: "SHIP_FRE",
              label: "Free",
              type: "SHIPPING",
              selected: true,
              amount: {
                value: "0.00",
                currencyCode,
              },
            },
            {
              id: "SHIP_EXP",
              label: "Expedited",
              type: "SHIPPING",
              selected: false,
              amount: {
                value: "5.00",
                currencyCode,
              },
            },
            {
              id: "SHIP_UNV",
              label: "Unavailable",
              type: "SHIPPING",
              selected: false,
              amount: {
                value: "1000",
                currencyCode,
              },
            },
          ],
        },
      },
    ],
  };
  return createOrder({ orderRequestBody, paypalRequestId });
}
