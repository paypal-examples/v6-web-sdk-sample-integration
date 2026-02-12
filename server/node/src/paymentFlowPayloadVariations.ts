import { randomUUID } from "crypto";

import {
  IntervalUnit,
  PaypalPaymentTokenUsageType,
  PlanRequestStatus,
  TenureType,
  VaultInstructionAction,
  VaultCardVerificationMethod,
} from "@paypal/paypal-server-sdk";

import {
  createSetupToken,
  createSubscriptionBillingPlan,
} from "./paypalServerSdk";

import { createSubscriptionProduct } from "./customApiEndpoints/createSubscriptionProduct";

const defaultCurrencyCode = "USD";
const defaultReturnUrl = "http://example.com";
const defaultCancelUrl = "http://example.com";

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
