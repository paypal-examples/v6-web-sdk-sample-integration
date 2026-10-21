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

  test.each([
    ["no client ID", { PAYPAL_SANDBOX_CLIENT_ID: "" }],
    ["neither a secret nor a token", { PAYPAL_SANDBOX_CLIENT_SECRET: "" }],
  ])("throws with %s", (_label, environment) => {
    for (const [name, value] of Object.entries(environment)) {
      vi.stubEnv(name, value);
    }

    expect(() => getAuthCredentials()).toThrow("Missing API credentials");
  });
});
