import { createHmac, createSign, generateKeyPairSync } from "node:crypto";
import { crc32 } from "node:zlib";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { SIMULATOR_WEBHOOK_ID } from "./constants";
import { verifyPayPalWebhook } from "./verifyPayPalWebhook";

const WEBHOOK_ID = "WH-123456789";
const DEV_WEBHOOK_SECRET = "dGVzdC1kZXYtc2VjcmV0LXRleHQ";

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
    "paypal-cli-simulated": "true",
  };
}

const rawBody = Buffer.from(
  JSON.stringify({ id: "evt-1", event_type: "PAYMENT.CAPTURE.COMPLETED" }),
);

const verify = (headers: Record<string, string>, body = rawBody) =>
  verifyPayPalWebhook(headers, body);

describe("verifyPayPalWebhook — PayPal-signed deliveries", () => {
  test("accepts a correctly signed event up to 5 minutes old", async () => {
    const transmissionTime = minutesFromTransmission(-4);

    expect(
      await verify(paypalSignedHeaders(rawBody, { transmissionTime })),
    ).toBe("paypal_sandbox_signed");
  });

  test.each([
    ["a tampered body", paypalSignedHeaders(rawBody), Buffer.from("{}")],
    [
      "a signature over a different webhook ID",
      paypalSignedHeaders(rawBody, { signingWebhookId: "some-other-id" }),
      rawBody,
    ],
    [
      "a replay more than 5 minutes old",
      paypalSignedHeaders(rawBody, {
        transmissionTime: minutesFromTransmission(-6),
      }),
      rawBody,
    ],
  ])("rejects %s", async (_label, headers, body) => {
    expect(await verify(headers, body)).toBeUndefined();
  });

  test("rejects a cert URL outside PayPal's domains without fetching it", async () => {
    const certUrl = "https://evil.example.com/cert.pem";

    expect(
      await verify(paypalSignedHeaders(rawBody, { certUrl })),
    ).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("fetches each certificate once, however its URL is spelled", async () => {
    const cert = "https://api.sandbox.paypal.com/v1/notifications/certs";
    const results = [];
    for (const certUrl of [
      `${cert}/CERT-alias`,
      `${cert}/x/../CERT-alias`,
      `${cert}/CERT-alias?x=1`,
      `${cert}/CERT-alias#x`,
      "https://api.sandbox.paypal.com:443/v1/notifications/certs/CERT-alias",
    ]) {
      results.push(await verify(paypalSignedHeaders(rawBody, { certUrl })));
    }

    expect(new Set(results)).toEqual(new Set(["paypal_sandbox_signed"]));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${cert}/CERT-alias`);
  });
});

describe("verifyPayPalWebhook — Webhooks Simulator deliveries", () => {
  const simulatorHeaders = paypalSignedHeaders(rawBody, {
    signingWebhookId: SIMULATOR_WEBHOOK_ID,
  });

  test("accepts a simulator delivery in dev mode, with no webhook ID needed", async () => {
    vi.stubEnv("PAYPAL_DEV", "1");
    vi.stubEnv("PAYPAL_WEBHOOK_ID", "");

    expect(await verify(simulatorHeaders)).toBe("paypal_simulator_signed");
  });

  // anyone can point the public simulator at any URL
  test("rejects a simulator delivery outside dev mode", async () => {
    expect(await verify(simulatorHeaders)).toBeUndefined();
  });
});

describe("verifyPayPalWebhook — PayPal CLI deliveries", () => {
  test("matches a signature produced by the CLI's own algorithm (fixed vector)", async () => {
    // Generated independently with the CLI's signing steps, so this pins
    // interop rather than this file's own helper.
    vi.stubEnv("PAYPAL_DEV", "1");
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

    expect(result).toBe("local_mock");
  });

  test("accepts a CLI-signed delivery in dev mode, with no webhook ID needed", async () => {
    vi.stubEnv("PAYPAL_DEV", "1");
    vi.stubEnv("PAYPAL_WEBHOOK_ID", "");

    expect(await verify(cliSignedHeaders(rawBody))).toBe("local_mock");
  });

  test.each([
    [
      "signed with a different secret",
      { PAYPAL_DEV: "1" },
      cliSignedHeaders(rawBody, { secret: "some-other-secret" }),
    ],
    ["outside dev mode", {}, cliSignedHeaders(rawBody)],
    [
      "in production, even with PAYPAL_DEV=1",
      { PAYPAL_DEV: "1", NODE_ENV: "production" },
      cliSignedHeaders(rawBody),
    ],
  ])("rejects a delivery %s", async (_label, environment, headers) => {
    for (const [name, value] of Object.entries(environment)) {
      vi.stubEnv(name, value);
    }

    expect(await verify(headers)).toBeUndefined();
  });
});
