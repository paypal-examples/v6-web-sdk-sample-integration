import { beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import express, { type Express } from "express";

import {
  createOrderForOneTimePaymentRouteHandler,
  createOrderForPayPalOneTimePaymentRouteHandler,
} from "./ordersRouteHandler";

import errorMiddleware from "../middleware/errorMiddleware";

const { createOrderMock, captureOrderMock } = vi.hoisted(() => {
  const createOrderMock = vi.fn().mockResolvedValue({
    statusCode: 201,
    result: {
      id: "53S42029KD820825W",
      status: "CREATED",
      links: [
        {
          href: "https://api.sandbox.paypal.com/v2/checkout/orders/53S42029KD820825W",
          rel: "self",
          method: "GET",
        },
        {
          href: "https://www.sandbox.paypal.com/checkoutnow?token=53S42029KD820825W",
          rel: "approve",
          method: "GET",
        },
        {
          href: "https://api.sandbox.paypal.com/v2/checkout/orders/53S42029KD820825W",
          rel: "update",
          method: "PATCH",
        },
        {
          href: "https://api.sandbox.paypal.com/v2/checkout/orders/53S42029KD820825W/capture",
          rel: "capture",
          method: "POST",
        },
      ],
    },
  });

  const captureOrderMock = vi.fn().mockResolvedValue({
    statusCode: 200,
    result: {
      id: "53S42029KD820825W",
      status: "COMPLETED",
      links: [
        {
          href: "https://api.sandbox.paypal.com/v2/checkout/orders/53S42029KD820825W",
          rel: "self",
          method: "GET",
        },
      ],
    },
  });

  return {
    createOrderMock,
    captureOrderMock,
  };
});

vi.mock("@paypal/paypal-server-sdk", async () => {
  const actual = await vi.importActual("@paypal/paypal-server-sdk");
  return {
    ...actual,
    OrdersController: vi.fn(
      class {
        createOrder = createOrderMock;
        captureOrder = captureOrderMock;
      },
    ),
  };
});

describe("createOrderForOneTimePaymentRouteHandler", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      createOrderForOneTimePaymentRouteHandler,
    );
    app.use(errorMiddleware);
  });

  test("should return a successful response with minimal required input", async () => {
    const response = await request(app)
      .post("/paypal-api/checkout/orders/create-order-for-one-time-payment")
      .send({});

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        status: "CREATED",
      }),
    );
    expect(createOrderMock).toBeCalledWith(
      expect.objectContaining({
        body: {
          intent: "CAPTURE",
          purchaseUnits: [
            {
              amount: {
                currencyCode: "USD",
                value: expect.any(String),
              },
            },
          ],
        },
      }),
    );
  });

  test("should return a successful response with optional input", async () => {
    const response = await request(app)
      .post("/paypal-api/checkout/orders/create-order-for-one-time-payment")
      .send({
        cart: [
          {
            sku: "i5b1g92y",
            quantity: 1,
          },
          {
            sku: "7pq2r5t8",
            quantity: 2,
          },
        ],
        currencyCode: "EUR",
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        status: "CREATED",
      }),
    );
    expect(createOrderMock).toBeCalledWith(
      expect.objectContaining({
        body: {
          intent: "CAPTURE",
          purchaseUnits: [
            {
              amount: {
                currencyCode: "EUR",
                value: expect.any(String),
              },
            },
          ],
        },
      }),
    );
  });

  test("should return 400 for invalid POST body", async () => {
    const response = await request(app)
      .post("/paypal-api/checkout/orders/create-order-for-one-time-payment")
      .send({
        // cart containing an item with an invalid sku
        cart: [
          {
            sku: "invalid_sku_value",
            quantity: 1,
          },
        ],
        currencyCode: "EUR",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: "Bad Request",
        errorDescription: expect.stringContaining(
          '✖ Invalid option: expected one of "1blwyeo8"|"i5b1g92y"|"3xk9m4n2"|"7pq2r5t8"',
        ),
      }),
    );
  });
});

describe("createOrderForPayPalOneTimePaymentRouteHandler", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post(
      "/paypal-api/checkout/orders/create-order-for-paypal-one-time-payment-with-redirect",
      createOrderForPayPalOneTimePaymentRouteHandler,
    );
    app.use(errorMiddleware);
  });

  test("should return a successful response and use referer for redirect and cancel urls", async () => {
    const response = await request(app)
      .post(
        "/paypal-api/checkout/orders/create-order-for-paypal-one-time-payment-with-redirect",
      )
      .set("Referer", "https://url-from-referer-header.com/")
      .send({});

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        status: "CREATED",
      }),
    );
    expect(createOrderMock).toBeCalledWith(
      expect.objectContaining({
        body: {
          intent: "CAPTURE",
          purchaseUnits: [
            {
              amount: {
                currencyCode: "USD",
                value: expect.any(String),
              },
            },
          ],
          paymentSource: {
            paypal: {
              experienceContext: {
                cancelUrl: "https://url-from-referer-header.com/",
                returnUrl: "https://url-from-referer-header.com/",
                shippingPreference: "NO_SHIPPING",
                userAction: "CONTINUE",
              },
            },
          },
        },
      }),
    );
  });

  test("should return a successful response with optional input", async () => {
    const response = await request(app)
      .post(
        "/paypal-api/checkout/orders/create-order-for-paypal-one-time-payment-with-redirect",
      )
      .send({
        cart: [
          {
            sku: "i5b1g92y",
            quantity: 1,
          },
        ],
        currencyCode: "USD",
        returnUrl: "https://www.custom-value.com/success-page-test",
        cancelUrl: "https://www.custom-value.com/cancel-page-test",
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        status: "CREATED",
      }),
    );
    expect(createOrderMock).toBeCalledWith(
      expect.objectContaining({
        body: {
          intent: "CAPTURE",
          purchaseUnits: [
            {
              amount: {
                currencyCode: "USD",
                value: expect.any(String),
              },
            },
          ],
          paymentSource: {
            paypal: {
              experienceContext: {
                cancelUrl: "https://www.custom-value.com/cancel-page-test",
                returnUrl: "https://www.custom-value.com/success-page-test",
                shippingPreference: "NO_SHIPPING",
                userAction: "CONTINUE",
              },
            },
          },
        },
      }),
    );
  });
});
