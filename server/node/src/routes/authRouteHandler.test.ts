import { beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import express, { type Express } from "express";

import {
  clientTokenRouteHandler,
  clientIdRouteHandler,
} from "./authRouteHandler";

const { requestTokenMock } = vi.hoisted(() => ({
  requestTokenMock: vi.fn(),
}));

vi.mock("@paypal/paypal-server-sdk", async () => {
  const actual = await vi.importActual("@paypal/paypal-server-sdk");
  requestTokenMock.mockResolvedValue({
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

  test("creates the client token for the app that issued the access token", async () => {
    vi.stubEnv("PAYPAL_ACCESS_TOKEN", "injected-token");
    vi.stubEnv("PAYPAL_CLIENT_ID", "tokenClientId");

    await request(app).get("/paypal-api/auth/browser-safe-client-token");

    expect(requestTokenMock).toHaveBeenLastCalledWith(
      {
        authorization: `Basic ${Buffer.from("tokenClientId:fakeClientSecret").toString("base64")}`,
      },
      expect.any(Object),
    );
  });

  test("fails with a clear error when the client secret is missing", async () => {
    vi.stubEnv("PAYPAL_SANDBOX_CLIENT_SECRET", "");

    const response = await request(app).get(
      "/paypal-api/auth/browser-safe-client-token",
    );

    expect(response.status).toBe(500);
    expect(response.text).toMatch(
      /PAYPAL_SANDBOX_CLIENT_SECRET environment variable is not defined/,
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

  test("returns the client ID of the app that issued the access token", async () => {
    vi.stubEnv("PAYPAL_ACCESS_TOKEN", "injected-token");
    vi.stubEnv("PAYPAL_CLIENT_ID", "tokenClientId");

    const response = await request(app).get(
      "/paypal-api/auth/browser-safe-client-id",
    );

    expect(response.body).toEqual({ clientId: "tokenClientId" });
  });
});
