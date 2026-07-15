import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import express, { type Express } from "express";

import {
  clientTokenRouteHandler,
  clientIdRouteHandler,
  lpmClientIdRouteHandler,
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
    vi.stubEnv("PAYPAL_SANDBOX_CLIENT_ID", "test-default-client-id");
    app = express();
    app.use(express.json());
    app.get("/paypal-api/auth/browser-safe-client-id", clientIdRouteHandler);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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

describe("lpmClientIdRouteHandler", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.get(
      "/paypal-api/auth/lpm-client-id/:lpmName",
      lpmClientIdRouteHandler,
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should return the LPM-specific credentials when configured", async () => {
    vi.stubEnv("MBWAY_PAYPAL_SANDBOX_CLIENT_ID", "mbway-test-client-id");
    vi.stubEnv("MBWAY_PAYPAL_SANDBOX_CLIENT_SECRET", "mbway-test-secret");
    vi.stubEnv("PAYPAL_SANDBOX_CLIENT_ID", "default-test-client-id");
    vi.stubEnv("PAYPAL_SANDBOX_CLIENT_SECRET", "default-test-secret");

    const response = await request(app).get(
      "/paypal-api/auth/lpm-client-id/mbway",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      clientId: "mbway-test-client-id",
      clientSecret: "mbway-test-secret",
    });
  });

  test("should fall back to default credentials when LPM-specific credential is not set", async () => {
    vi.stubEnv("MBWAY_PAYPAL_SANDBOX_CLIENT_ID", "");
    vi.stubEnv("MBWAY_PAYPAL_SANDBOX_CLIENT_SECRET", "");
    vi.stubEnv("PAYPAL_SANDBOX_CLIENT_ID", "default-test-client-id");
    vi.stubEnv("PAYPAL_SANDBOX_CLIENT_SECRET", "default-test-secret");

    const response = await request(app).get(
      "/paypal-api/auth/lpm-client-id/mbway",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      clientId: "default-test-client-id",
      clientSecret: "default-test-secret",
    });
  });

  test("should fall back to default credentials for unknown LPM name", async () => {
    vi.stubEnv("PAYPAL_SANDBOX_CLIENT_ID", "default-test-client-id");
    vi.stubEnv("PAYPAL_SANDBOX_CLIENT_SECRET", "default-test-secret");

    const response = await request(app).get(
      "/paypal-api/auth/lpm-client-id/unknown_lpm",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      clientId: "default-test-client-id",
      clientSecret: "default-test-secret",
    });
  });

  test("should handle camelCase LPM names correctly", async () => {
    vi.stubEnv("MBWAY_PAYPAL_SANDBOX_CLIENT_ID", "mbway-test-client-id");
    vi.stubEnv("MBWAY_PAYPAL_SANDBOX_CLIENT_SECRET", "mbway-test-secret");
    vi.stubEnv("PAYPAL_SANDBOX_CLIENT_ID", "default-test-client-id");
    vi.stubEnv("PAYPAL_SANDBOX_CLIENT_SECRET", "default-test-secret");

    const response = await request(app).get(
      "/paypal-api/auth/lpm-client-id/mbway",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      clientId: "mbway-test-client-id",
      clientSecret: "mbway-test-secret",
    });
  });
});
