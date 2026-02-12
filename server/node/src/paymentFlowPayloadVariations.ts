import { randomUUID } from "crypto";

import {
  IntervalUnit,
  PlanRequestStatus,
  TenureType,
} from "@paypal/paypal-server-sdk";

import { createSubscriptionBillingPlan } from "./paypalServerSdk";

import { createSubscriptionProduct } from "./customApiEndpoints/createSubscriptionProduct";

const defaultCurrencyCode = "USD";

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
