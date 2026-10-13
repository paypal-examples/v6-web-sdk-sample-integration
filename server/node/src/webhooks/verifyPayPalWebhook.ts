import { createHmac, createVerify, timingSafeEqual } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";
import { crc32 } from "node:zlib";

import {
  CERT_FETCH_TIMEOUT_MS,
  CLI_SIGNATURE_AUDIENCE,
  HEADERS,
  TRANSMISSION_TIME_TOLERANCE_MS,
  NOT_VERIFIED,
  SIMULATOR_WEBHOOK_ID,
  TRUSTED_CERT_HOSTS,
} from "./constants";
import type { PayPalSignature, VerifyPayPalWebhookResult } from "./types";

const certCache = new Map<string, string>();

export function isPayPalWebhookIdSet(): boolean {
  return Boolean(process.env.PAYPAL_WEBHOOK_ID);
}

/** Dev mode: started with PAYPAL_DEV=1 (as `paypal dev` does), never in production. */
export function isWebhookDevelopmentModeEnabled(): boolean {
  return (
    process.env.PAYPAL_DEV === "1" && process.env.NODE_ENV !== "production"
  );
}

export async function verifyPayPalWebhook(
  headers: IncomingHttpHeaders,
  rawBody: Buffer,
): Promise<VerifyPayPalWebhookResult> {
  const { PAYPAL_WEBHOOK_ID, PAYPAL_DEV_WEBHOOK_SECRET } = process.env;
  const transmissionId = getHeader(headers, HEADERS.transmissionId);
  const transmissionTime = getHeader(headers, HEADERS.transmissionTime);
  if (!transmissionId || !transmissionTime || !isRecent(transmissionTime)) {
    return NOT_VERIFIED;
  }

  const bodyCrc = crc32(rawBody);
  const signedMessage = (id: string) =>
    `${transmissionId}|${transmissionTime}|${id}|${bodyCrc}`;

  const paypalSignature = await readPayPalSignature(headers);

  if (
    paypalSignature &&
    PAYPAL_WEBHOOK_ID &&
    verifyPayPalSignature(paypalSignature, signedMessage(PAYPAL_WEBHOOK_ID))
  ) {
    return { verified: true, eventFidelity: "paypal_sandbox_signed" };
  }

  if (!isWebhookDevelopmentModeEnabled()) {
    return NOT_VERIFIED;
  }

  if (
    paypalSignature &&
    verifyPayPalSignature(paypalSignature, signedMessage(SIMULATOR_WEBHOOK_ID))
  ) {
    return { verified: true, eventFidelity: "paypal_simulator_signed" };
  }

  // the CLI requires checking its marker header before trusting its signature
  if (
    PAYPAL_DEV_WEBHOOK_SECRET &&
    getHeader(headers, HEADERS.cliSimulated) === "true" &&
    verifyCliSignature(
      getHeader(headers, HEADERS.cliSignature),
      PAYPAL_DEV_WEBHOOK_SECRET,
      signedMessage(CLI_SIGNATURE_AUDIENCE),
    )
  ) {
    return { verified: true, eventFidelity: "local_mock" };
  }

  return NOT_VERIFIED;
}

function getHeader(
  headers: IncomingHttpHeaders,
  name: string,
): string | undefined {
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function isRecent(transmissionTime: string): boolean {
  // an unparseable time gives NaN, which fails the comparison
  return (
    Math.abs(Date.now() - Date.parse(transmissionTime)) <=
    TRANSMISSION_TIME_TOLERANCE_MS
  );
}

async function readPayPalSignature(
  headers: IncomingHttpHeaders,
): Promise<PayPalSignature | undefined> {
  const signature = getHeader(headers, HEADERS.transmissionSig);
  const certUrl = getHeader(headers, HEADERS.certUrl);
  if (!signature || !certUrl || !isTrustedCertUrl(certUrl)) {
    return undefined;
  }

  const cert = await getCert(certUrl);
  return cert ? { cert, signature } : undefined;
}

function verifyPayPalSignature(
  { cert, signature }: PayPalSignature,
  message: string,
): boolean {
  try {
    return createVerify("RSA-SHA256")
      .update(message)
      .verify(cert, signature, "base64");
  } catch {
    return false;
  }
}

function verifyCliSignature(
  signature: string | undefined,
  webhookSecret: string,
  message: string,
): boolean {
  if (!signature) {
    return false;
  }

  const expected = `v1=${createHmac("sha256", webhookSecret).update(message).digest("base64")}`;
  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(signature, "utf8");
  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

// the cert URL comes from the request, so only fetch it from PayPal; otherwise a
// caller could sign with their own key and point this at their own cert
function isTrustedCertUrl(certUrl: string): boolean {
  try {
    const { protocol, hostname, port, search, hash } = new URL(certUrl);
    return (
      protocol === "https:" &&
      TRUSTED_CERT_HOSTS.has(hostname) &&
      // a custom port, query string or fragment isn't part of a PayPal cert
      // URL, and would let a caller create endless cache entries
      !port &&
      !search &&
      !hash
    );
  } catch {
    return false;
  }
}

async function getCert(certUrl: string): Promise<string | undefined> {
  const cached = certCache.get(certUrl);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(certUrl, {
      signal: AbortSignal.timeout(CERT_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      return undefined;
    }
    const cert = await response.text();
    certCache.set(certUrl, cert);
    return cert;
  } catch {
    return undefined;
  }
}
