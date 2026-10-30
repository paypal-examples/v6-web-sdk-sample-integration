import { describe, expect, test, vi } from "vitest";

import { getAuthCredentials } from "./paypalServerSdkClient";

describe("getAuthCredentials", () => {
  test("uses the client ID and secret", () => {
    expect(getAuthCredentials()).toEqual({
      oAuthClientId: "fakeClientId",
      oAuthClientSecret: "fakeClientSecret",
    });
  });

  test("uses an access token instead of the client secret", async () => {
    vi.stubEnv("PAYPAL_SANDBOX_CLIENT_SECRET", "");
    vi.stubEnv("PAYPAL_ACCESS_TOKEN", "injected-token");

    const credentials = getAuthCredentials();

    expect(credentials.oAuthClientSecret).toBe("");
    expect(await credentials.oAuthTokenProvider?.()).toEqual({
      accessToken: "injected-token",
      tokenType: "Bearer",
    });
  });

  test("prefers the access token over a client secret", () => {
    vi.stubEnv("PAYPAL_ACCESS_TOKEN", "injected-token");

    expect(getAuthCredentials()).toEqual(
      expect.objectContaining({
        oAuthClientSecret: "",
        oAuthTokenProvider: expect.any(Function),
      }),
    );
  });

  test("uses the client ID of the app that issued the access token", () => {
    vi.stubEnv("PAYPAL_ACCESS_TOKEN", "injected-token");
    vi.stubEnv("PAYPAL_CLIENT_ID", "tokenClientId");

    expect(getAuthCredentials().oAuthClientId).toBe("tokenClientId");
  });

  test("works with only the variables `paypal dev` sets", () => {
    vi.stubEnv("PAYPAL_SANDBOX_CLIENT_ID", "");
    vi.stubEnv("PAYPAL_SANDBOX_CLIENT_SECRET", "");
    vi.stubEnv("PAYPAL_ACCESS_TOKEN", "injected-token");
    vi.stubEnv("PAYPAL_CLIENT_ID", "tokenClientId");

    expect(getAuthCredentials().oAuthClientId).toBe("tokenClientId");
  });

  test("ignores PAYPAL_CLIENT_ID without an access token", () => {
    vi.stubEnv("PAYPAL_CLIENT_ID", "tokenClientId");

    expect(getAuthCredentials().oAuthClientId).toBe("fakeClientId");
  });

  test.each([
    ["no client ID", { PAYPAL_SANDBOX_CLIENT_ID: "" }],
    ["neither a secret nor a token", { PAYPAL_SANDBOX_CLIENT_SECRET: "" }],
  ])("throws with %s", (_label, environment) => {
    for (const [name, value] of Object.entries(environment)) {
      vi.stubEnv(name, value);
    }

    expect(() => getAuthCredentials()).toThrow(
      "Missing API credentials: set PAYPAL_SANDBOX_CLIENT_ID",
    );
  });

  test("says the client ID is missing when only a token is set", () => {
    vi.stubEnv("PAYPAL_SANDBOX_CLIENT_ID", "");
    vi.stubEnv("PAYPAL_ACCESS_TOKEN", "injected-token");

    expect(() => getAuthCredentials()).toThrow(
      "PAYPAL_ACCESS_TOKEN is set, but PAYPAL_CLIENT_ID isn't",
    );
  });
});
