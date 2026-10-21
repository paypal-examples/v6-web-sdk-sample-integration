import { createHmac, createSign, generateKeyPairSync } from "node:crypto";
import { crc32 } from "node:zlib";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { NOT_VERIFIED } from "./constants";
import { verifyPayPalWebhook } from "./verifyPayPalWebhook";

const WEBHOOK_ID = "WH-123456789";
const DEV_WEBHOOK_SECRET = "dGVzdC1kZXYtc2VjcmV0LXRleHQ";

// PayPal's Webhooks Simulator always signs with this literal ID — see "Test
// the listener with mock events" at
// https://developer.paypal.com/api/rest/webhooks/rest/
const SIMULATOR_WEBHOOK_ID = "WEBHOOK_ID";

// the tests sign every delivery at this time, so the clock is pinned to it
const TRANSMISSION_TIME = "2026-06-15T12:00:00.000Z";
const minutesFromTransmission = (minutes: number) =>
  new Date(Date.parse(TRANSMISSION_TIME) + minutes * 60_000).toISOString();

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const publicKeyPem = publicKey
  .export({ type: "spki", format: "pem" })
  .toString();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(TRANSMISSION_TIME));
  vi.stubEnv("PAYPAL_WEBHOOK_ID", WEBHOOK_ID);
  vi.stubEnv("PAYPAL_DEV_WEBHOOK_SECRET", DEV_WEBHOOK_SECRET);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(publicKeyPem),
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function enableDevelopmentMode() {
  vi.stubEnv("PAYPAL_DEV", "1");
}

// Signs like PayPal: RSA-SHA256 over transmissionId|time|webhookId|crc32.
function paypalSignedHeaders(
  rawBody: Buffer,
  options: {
    certUrl?: string;
    signingWebhookId?: string;
    transmissionTime?: string;
  } = {},
): Record<string, string> {
  const transmissionId = "txn-1";
  const transmissionTime = options.transmissionTime ?? TRANSMISSION_TIME;
  const message = `${transmissionId}|${transmissionTime}|${options.signingWebhookId ?? WEBHOOK_ID}|${crc32(rawBody)}`;

  return {
    "paypal-transmission-id": transmissionId,
    "paypal-transmission-time": transmissionTime,
    "paypal-transmission-sig": createSign("RSA-SHA256")
      .update(message)
      .sign(privateKey, "base64"),
    "paypal-cert-url":
      options.certUrl ??
      "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-1",
    "paypal-auth-algo": "SHA256withRSA",
  };
}

// Signs like the PayPal CLI's `signBody` (src/services/webhook/delivery.ts in
// the CLI repo): HMAC-SHA256 over the canonical string, keyed by the secret
// text's UTF-8 bytes, sent as `v1=` + padded Base64.
function cliSignedHeaders(
  rawBody: Buffer,
  options: {
    secret?: string;
    simulated?: boolean;
  } = {},
): Record<string, string> {
  const transmissionId = "0b7c4a2e-1f3d-4c5b-9a8e-6d2f1e0c3b4a";
  const transmissionTime = TRANSMISSION_TIME;
  const canonical = `${transmissionId}|${transmissionTime}|PAYPALCLIDEVWEBHOOKV1|${crc32(rawBody)}`;

  return {
    "paypal-transmission-id": transmissionId,
    "paypal-transmission-time": transmissionTime,
    "paypal-cli-webhook-signature": `v1=${createHmac(
      "sha256",
      Buffer.from(options.secret ?? DEV_WEBHOOK_SECRET, "utf8"),
    )
      .update(canonical)
      .digest("base64")}`,
    ...((options.simulated ?? true) && { "paypal-cli-simulated": "true" }),
  };
}

const rawBody = Buffer.from(
  JSON.stringify({ id: "evt-1", event_type: "PAYMENT.CAPTURE.COMPLETED" }),
);

const verify = (headers: Record<string, string>, body = rawBody) =>
  verifyPayPalWebhook(headers, body);

describe("verifyPayPalWebhook — PayPal-signed sandbox deliveries", () => {
  test("accepts a correctly signed event", async () => {
    expect(await verify(paypalSignedHeaders(rawBody))).toEqual({
      verified: true,
      eventFidelity: "paypal_sandbox_signed",
    });
  });

  test("reports sandbox fidelity even if a request claims to be CLI-simulated", async () => {
    const headers = {
      ...paypalSignedHeaders(rawBody),
      "paypal-cli-simulated": "true",
    };
    expect(await verify(headers)).toEqual({
      verified: true,
      eventFidelity: "paypal_sandbox_signed",
    });
  });

  test("rejects a tampered body", async () => {
    const tampered = Buffer.from(JSON.stringify({ id: "evt-1-tampered" }));
    expect(await verify(paypalSignedHeaders(rawBody), tampered)).toEqual(
      NOT_VERIFIED,
    );
  });

  test("rejects a signature over a different webhook ID", async () => {
    const headers = paypalSignedHeaders(rawBody, {
      signingWebhookId: "some-other-id",
    });
    expect(await verify(headers)).toEqual(NOT_VERIFIED);
  });

  test.each([
    ["4 minutes old", minutesFromTransmission(-4), true],
    ["6 minutes old (replay)", minutesFromTransmission(-6), false],
    ["6 minutes in the future", minutesFromTransmission(6), false],
    ["malformed", "not-a-date", false],
  ])(
    "accepts only a transmission time within 5 minutes: %s",
    async (_label, transmissionTime, expected) => {
      const result = await verify(
        paypalSignedHeaders(rawBody, { transmissionTime }),
      );
      expect(result.verified).toBe(expected);
    },
  );

  describe("certificate URL", () => {
    test.each([
      [
        "outside PayPal's domains (SSRF guard)",
        "https://evil.example.com/cert.pem",
      ],
      [
        "over plain http",
        // eslint-disable-next-line unicorn/prefer-https -- plain http is what's under test
        "http://api.sandbox.paypal.com/v1/notifications/certs/CERT-1",
      ],
      [
        "with a query string",
        "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-1?x=1",
      ],
      [
        "with a fragment",
        "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-1#1",
      ],
      [
        "with a custom port",
        "https://api.sandbox.paypal.com:8443/v1/notifications/certs/CERT-1",
      ],
      [
        "outside PayPal's cert path",
        "https://api.sandbox.paypal.com/v1/oauth2/token",
      ],
    ])("rejects a cert URL %s without fetching it", async (_label, certUrl) => {
      expect(await verify(paypalSignedHeaders(rawBody, { certUrl }))).toEqual(
        NOT_VERIFIED,
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    test("fetches a certificate once and reuses it", async () => {
      const headers = paypalSignedHeaders(rawBody, {
        certUrl:
          "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-cached",
      });

      const first = await verify(headers);
      const second = await verify(headers);

      expect([first.verified, second.verified]).toEqual([true, true]);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });

    test("caches one entry for different spellings of a cert URL", async () => {
      const certs = "https://api.sandbox.paypal.com/v1/notifications/certs";

      await verify(
        paypalSignedHeaders(rawBody, { certUrl: `${certs}/x/../CERT-dots` }),
      );
      await verify(
        paypalSignedHeaders(rawBody, { certUrl: `${certs}/CERT-dots` }),
      );

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});

describe("verifyPayPalWebhook — Webhooks Simulator deliveries (dev mode only)", () => {
  const simulatorHeaders = paypalSignedHeaders(rawBody, {
    signingWebhookId: SIMULATOR_WEBHOOK_ID,
  });

  test("accepts a simulator delivery in dev mode", async () => {
    enableDevelopmentMode();
    expect(await verify(simulatorHeaders)).toEqual({
      verified: true,
      eventFidelity: "paypal_simulator_signed",
    });
  });

  test("accepts a simulator delivery in dev mode with no webhook ID configured", async () => {
    enableDevelopmentMode();
    vi.stubEnv("PAYPAL_WEBHOOK_ID", "");
    const result = await verify(simulatorHeaders);
    expect(result.eventFidelity).toBe("paypal_simulator_signed");
  });

  test("rejects a simulator delivery outside dev mode — anyone can point the public simulator at any URL", async () => {
    expect(await verify(simulatorHeaders)).toEqual(NOT_VERIFIED);
  });

  test("rejects a simulator delivery when NODE_ENV is production, even with PAYPAL_DEV=1", async () => {
    enableDevelopmentMode();
    vi.stubEnv("NODE_ENV", "production");
    expect(await verify(simulatorHeaders)).toEqual(NOT_VERIFIED);
  });
});

describe("verifyPayPalWebhook — PayPal CLI deliveries (dev mode only)", () => {
  test("matches a signature produced by the CLI's own algorithm (fixed vector)", async () => {
    // Generated independently with the CLI's signing steps, so this pins
    // interop rather than this file's own helper.
    enableDevelopmentMode();
    const result = await verify(
      {
        "paypal-cli-simulated": "true",
        "paypal-transmission-id": "0b7c4a2e-1f3d-4c5b-9a8e-6d2f1e0c3b4a",
        "paypal-transmission-time": "2026-06-15T12:00:00.000Z",
        "paypal-cli-webhook-signature":
          "v1=DsX94i8HBOi//g3I6fCoojfEEYO1oBtMjY5CMyMnj+g=",
      },
      Buffer.from(
        JSON.stringify({
          id: "evt-cli-1",
          event_type: "PAYMENT.CAPTURE.COMPLETED",
        }),
      ),
    );

    expect(result).toEqual({ verified: true, eventFidelity: "local_mock" });
  });

  test("accepts a CLI-signed delivery with no webhook ID configured", async () => {
    enableDevelopmentMode();
    vi.stubEnv("PAYPAL_WEBHOOK_ID", "");
    expect(await verify(cliSignedHeaders(rawBody))).toEqual({
      verified: true,
      eventFidelity: "local_mock",
    });
  });

  // `webhook listen --poll` forwards old events, signed with the time it sends them
  test("accepts an old event forwarded from history", async () => {
    enableDevelopmentMode();
    const historyEvent = Buffer.from(
      JSON.stringify({
        id: "evt-old",
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        create_time: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(await verify(cliSignedHeaders(historyEvent), historyEvent)).toEqual({
      verified: true,
      eventFidelity: "local_mock",
    });
  });

  test.each([
    ["without the paypal-cli-simulated marker", { simulated: false }],
    ["signed with a different secret", { secret: "some-other-secret" }],
  ])("rejects a delivery %s", async (_label, options) => {
    enableDevelopmentMode();
    expect(await verify(cliSignedHeaders(rawBody, options))).toEqual(
      NOT_VERIFIED,
    );
  });

  test("rejects a tampered body", async () => {
    enableDevelopmentMode();
    const tampered = Buffer.from(JSON.stringify({ id: "evt-1-tampered" }));
    expect(await verify(cliSignedHeaders(rawBody), tampered)).toEqual(
      NOT_VERIFIED,
    );
  });

  test("rejects a correctly signed delivery when PAYPAL_DEV isn't set", async () => {
    expect(await verify(cliSignedHeaders(rawBody))).toEqual(NOT_VERIFIED);
  });

  test("rejects a correctly signed delivery when NODE_ENV is production, even with PAYPAL_DEV=1", async () => {
    enableDevelopmentMode();
    vi.stubEnv("NODE_ENV", "production");
    expect(await verify(cliSignedHeaders(rawBody))).toEqual(NOT_VERIFIED);
  });
});
