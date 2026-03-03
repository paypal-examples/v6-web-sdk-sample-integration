import {
  IntervalUnit,
  PlanRequestStatus,
  SubscriptionsController,
  TenureType,
} from "@paypal/paypal-server-sdk";
import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";

import { client } from "../paypalServerSdkClient";
import { createSubscriptionProduct } from "../customApiEndpoints/createSubscriptionProduct";

const subscriptionsController = new SubscriptionsController(client);

export async function createSubscriptionRouteHandler(
  _request: Request,
  response: Response,
) {
  let planId = process.env.PAYPAL_SUBSCRIPTION_PLAN_ID;

  if (!planId) {
    const { result } = await createMonthlySubscriptionBillingPlan();
    if (!result.id) {
      throw new Error("Failed to create subscription billing plan");
    }
    planId = result.id;
  }

  const { result, statusCode } =
    await subscriptionsController.createSubscription({
      body: { planId },
      prefer: "return=minimal",
      paypalRequestId: randomUUID(),
    });

  response.status(statusCode).json(result);
}

async function createMonthlySubscriptionBillingPlan() {
  const currencyCode = "USD";
  const amountValue = "9.99";

  const { id } = await createSubscriptionProduct({
    name: "Sample Subscription Product",
    description: "Sample product for subscription testing",
    type: "SERVICE",
    category: "SOFTWARE",
  });

  const planRequestBody = {
    productId: id,
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

  return subscriptionsController.createBillingPlan({
    body: planRequestBody,
    paypalRequestId: randomUUID(),
    prefer: "return=minimal",
  });
}
