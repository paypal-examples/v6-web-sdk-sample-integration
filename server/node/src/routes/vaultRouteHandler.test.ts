import { beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import express, { type Express } from "express";

import {
  createSetupTokenForPayPalSavePaymentRouteHandler,
  createSetupTokenForCardSavePaymentRouteHandler,
  createPaymentTokenRouteHandler,
} from "./vaultRouteHandler";

import errorMiddleware from "../middleware/errorMiddleware";

const { createSetupTokenMock, createPaymentTokenMock } = vi.hoisted(() => {
  const createSetupTokenMock = vi.fn().mockResolvedValue({
    statusCode: 201,
    result: {
      id: "86X52341WJ042351K",
      customer: {
        id: "BzBtgfDHYx",
      },
      status: "PAYER_ACTION_REQUIRED",
      links: [
        {
          href: "https://api.sandbox.paypal.com/v3/vault/setup-tokens/86X52341WJ042351K",
          rel: "self",
          method: "GET",
        },
        {
          href: "https://www.sandbox.paypal.com/agreements/approve?approval_session_id=86X52341WJ042351K",
          rel: "approve",
          method: "GET",
        },
      ],
    },
  });

  const createPaymentTokenMock = vi.fn().mockResolvedValue({
    statusCode: 201,
    result: {
      id: "8kk8451t",
      customer: {
        id: "BygeLlrpZF",
        merchantCustomerId: "customer@merchant.com",
      },
      links: [
        {
          rel: "self",
          href: "https://api-m.paypal.com/v3/vault/payment-tokens/8kk8451t",
          method: "GET",
          encType: "application/json",
        },
        {
          rel: "delete",
          href: "https://api-m.paypal.com/v3/vault/payment-tokens/8kk8451t",
          method: "DELETE",
          encType: "application/json",
        },
      ],
    },
  });

  return {
    createSetupTokenMock,
    createPaymentTokenMock,
  };
});

vi.mock("@paypal/paypal-server-sdk", async () => {
  const actual = await vi.importActual("@paypal/paypal-server-sdk");
  return {
    ...actual,
    VaultController: vi.fn(
      class {
        createSetupToken = createSetupTokenMock;
        createPaymentToken = createPaymentTokenMock;
      },
    ),
  };
});

describe("createSetupTokenForPayPalSavePaymentRouteHandler", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post(
      "/paypal-api/vault/create-setup-token-for-paypal-save-payment",
      createSetupTokenForPayPalSavePaymentRouteHandler,
    );
    app.use(errorMiddleware);
  });

  test("should return a successful response with minimal required input", async () => {
    const response = await request(app)
      .post("/paypal-api/vault/create-setup-token-for-paypal-save-payment")
      .set("Referer", "https://url-from-referer-header.com/")
      .send({});

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        status: "PAYER_ACTION_REQUIRED",
      }),
    );
    expect(createSetupTokenMock).toBeCalledWith(
      expect.objectContaining({
        body: {
          paymentSource: {
            paypal: {
              experienceContext: {
                cancelUrl: "https://url-from-referer-header.com/",
                returnUrl: "https://url-from-referer-header.com/",
                vaultInstruction: "ON_PAYER_APPROVAL",
              },
              usageType: "MERCHANT",
            },
          },
        },
      }),
    );
  });
});

describe("createSetupTokenForCardSavePaymentRouteHandler", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post(
      "/paypal-api/vault/create-setup-token-for-card-save-payment",
      createSetupTokenForCardSavePaymentRouteHandler,
    );
    app.use(errorMiddleware);
  });

  test("should return a successful response with minimal required input", async () => {
    const response = await request(app)
      .post("/paypal-api/vault/create-setup-token-for-card-save-payment")
      .set("Referer", "https://url-from-referer-header.com/")
      .send({});

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        status: "PAYER_ACTION_REQUIRED",
      }),
    );
    expect(createSetupTokenMock).toBeCalledWith(
      expect.objectContaining({
        body: {
          paymentSource: {
            card: {
              experienceContext: {
                cancelUrl: "https://url-from-referer-header.com/",
                returnUrl: "https://url-from-referer-header.com/",
              },
              usageType: "MERCHANT",
              verificationMethod: "SCA_WHEN_REQUIRED",
            },
          },
        },
      }),
    );
  });
});

describe("createPaymentTokenRouteHandler", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post(
      "/paypal-api/vault/payment-token/create",
      createPaymentTokenRouteHandler,
    );
    app.use(errorMiddleware);
  });

  test("should return a successful response", async () => {
    const response = await request(app)
      .post("/paypal-api/vault/payment-token/create")
      .send({
        vaultSetupToken: "86X52341WJ042351K",
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: "SUCCESS",
        description: "Payment token saved to database for future transactions",
      }),
    );
    expect(createPaymentTokenMock).toBeCalledWith(
      expect.objectContaining({
        body: {
          paymentSource: {
            token: {
              id: expect.any(String),
              type: "SETUP_TOKEN",
            },
          },
        },
      }),
    );
  });

  test("should return 400 for invalid POST body", async () => {
    const response = await request(app)
      .post("/paypal-api/vault/payment-token/create")
      .send({
        // missing setupPaymentToken
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: "Bad Request",
        errorDescription: expect.stringContaining(
          "✖ Invalid input: expected string, received undefined\n  → at vaultSetupToken",
        ),
      }),
    );
  });
});
