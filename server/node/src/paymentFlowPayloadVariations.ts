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
  ShippingType,
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

const defaultCurrencyCode = "USD";
const defaultAmountValue = "100.00";
const defaultReturnUrl = "http://example.com";
const defaultCancelUrl = "http://example.com";

function getDefaultOptions() {
  return {
    currencyCode: defaultCurrencyCode,
    amountValue: defaultAmountValue,
    returnUrl: defaultReturnUrl,
    cancelUrl: defaultCancelUrl,
    paypalRequestId: randomUUID(),
  };
}

type CreateOrderForOneTimePaymentOptions = {
  currencyCode?: string;
  amountValue?: string;
  paypalRequestId?: string;
};

export function createOrderForOneTimePayment(
  {
    currencyCode = defaultCurrencyCode,
    amountValue = defaultAmountValue,
    paypalRequestId = randomUUID(),
  }: CreateOrderForOneTimePaymentOptions = getDefaultOptions(),
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
  currencyCode?: string;
  amountValue?: string;
  returnUrl?: string;
  cancelUrl?: string;
  paypalRequestId?: string;
};

export async function createOrderForPayPalOneTimePaymentWithVault(
  {
    currencyCode = defaultCurrencyCode,
    amountValue = defaultAmountValue,
    paypalRequestId = randomUUID(),
    returnUrl = defaultReturnUrl,
    cancelUrl = defaultCancelUrl,
  }: CreateOrderForPayPalOneTimePaymentWithVaultOptions = getDefaultOptions(),
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
  currencyCode?: string;
  amountValue?: string;
  returnUrl?: string;
  cancelUrl?: string;
  paypalRequestId?: string;
};

export function createOrderForPayPalOneTimePaymentWithRedirect(
  {
    currencyCode = defaultCurrencyCode,
    amountValue = defaultAmountValue,
    paypalRequestId = randomUUID(),
    returnUrl = defaultReturnUrl,
    cancelUrl = defaultCancelUrl,
  }: CreateOrderForPayPalOneTimePaymentWithRedirectOptions = getDefaultOptions(),
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
  returnUrl?: string;
  cancelUrl?: string;
  paypalRequestId?: string;
};

export function createSetupTokenForPayPalSavePayment(
  {
    returnUrl = defaultReturnUrl,
    cancelUrl = defaultCancelUrl,
    paypalRequestId = randomUUID(),
  }: CreateSetupTokenForPayPalSavePaymentOptions = {
    returnUrl: defaultReturnUrl,
    cancelUrl: defaultCancelUrl,
    paypalRequestId: randomUUID(),
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
    returnUrl = defaultReturnUrl,
    cancelUrl = defaultCancelUrl,
    paypalRequestId = randomUUID(),
  }: CreateSetupTokenForCardSavePaymentOptions = {
    returnUrl: defaultReturnUrl,
    cancelUrl: defaultCancelUrl,
    paypalRequestId: randomUUID(),
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
    currencyCode = defaultCurrencyCode,
    amountValue = "9.99",
    paypalRequestId = randomUUID(),
  }: CreateMonthlySubscriptionBillingPlanOptions = {
    currencyCode: defaultCurrencyCode,
    amountValue: "9.99",
    paypalRequestId: randomUUID(),
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
  currencyCode = defaultCurrencyCode,
  amountValue = defaultAmountValue,
  paypalRequestId = randomUUID(),
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

export function createOrderForCardOneTimePaymentWithThreeDSecure(
  {
    currencyCode = defaultCurrencyCode,
    amountValue = defaultAmountValue,
    returnUrl = defaultReturnUrl,
    cancelUrl = defaultCancelUrl,
    paypalRequestId = randomUUID(),
  }: CreateOrderForCardOneTimePaymentWithThreeDSecureOptions = getDefaultOptions(),
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

type CreateOrderForOneTimePaymentWithShippingOptions = {
  currencyCode?: string;
  amountValue?: string;
  paypalRequestId?: string;
};

export function createOrderForOneTimePaymentWithShipping(
  {
    currencyCode = defaultCurrencyCode,
    amountValue = defaultAmountValue,
    paypalRequestId = randomUUID(),
  }: CreateOrderForOneTimePaymentWithShippingOptions = getDefaultOptions(),
) {
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
              type: ShippingType.Shipping,
              selected: true,
              amount: {
                value: "0.00",
                currencyCode,
              },
            },
            {
              id: "SHIP_EXP",
              label: "Expedited",
              type: ShippingType.Shipping,
              selected: false,
              amount: {
                value: "5.00",
                currencyCode,
              },
            },
            {
              id: "SHIP_UNV",
              label: "Unavailable",
              type: ShippingType.Shipping,
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
