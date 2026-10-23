import { describe, expect, test, vi } from "vitest";

import { getFullScopeAccessToken } from "./authorization";

describe("getFullScopeAccessToken", () => {
  test("returns an access token that is set, without calling PayPal", async () => {
    vi.stubEnv("PAYPAL_ACCESS_TOKEN", "injected-token");
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    expect(await getFullScopeAccessToken()).toBe("injected-token");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("otherwise requests a token with the client ID and secret", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ access_token: "minted-token" }));

    expect(await getFullScopeAccessToken()).toBe("minted-token");
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/v1/oauth2/token"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Basic ${Buffer.from("fakeClientId:fakeClientSecret").toString("base64")}`,
        }),
      }),
    );
  });
});
