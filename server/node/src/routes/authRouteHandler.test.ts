import { beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import express, { type Express } from "express";

import {
  clientTokenRouteHandler,
  clientIdRouteHandler,
} from "./authRouteHandler";

vi.mock("@paypal/paypal-server-sdk", async () => {
  const actual = await vi.importActual("@paypal/paypal-server-sdk");
  const requestTokenMock = vi.fn().mockResolvedValue({
    statusCode: 200,
    result: {
      accessToken: "fakeValue",
      expiresIn: 900,
      scope:
        "https://uri.paypal.com/services/payments/orders/client_sdk_orders_api https://uri.paypal.com/services/payments/client-payments-eligibility",
      tokenType: "Bearer",
    },
  });

  return {
    ...actual,
    OAuthAuthorizationController: vi.fn(
      class {
        requestToken = requestTokenMock;
      },
    ),
  };
});

describe("clientTokenRouteHandler", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.get(
      "/paypal-api/auth/browser-safe-client-token",
      clientTokenRouteHandler,
    );
  });

  test("should return a successful response", async () => {
    const response = await request(app).get(
      "/paypal-api/auth/browser-safe-client-token",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        accessToken: "fakeValue",
        expiresIn: 900,
      }),
    );
  });
});

describe("clientIdRouteHandler", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.get("/paypal-api/auth/browser-safe-client-id", clientIdRouteHandler);
  });

  test("should return a successful response", async () => {
    const response = await request(app).get(
      "/paypal-api/auth/browser-safe-client-id",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        clientId: expect.any(String),
      }),
    );
  });
});
