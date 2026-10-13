import type { VerifyPayPalWebhookResult } from "./types";

export const HEADERS = {
  transmissionId: "paypal-transmission-id",
  transmissionTime: "paypal-transmission-time",
  transmissionSig: "paypal-transmission-sig",
  certUrl: "paypal-cert-url",
  cliSimulated: "paypal-cli-simulated",
  cliSignature: "paypal-cli-webhook-signature",
} as const;

export const TRUSTED_CERT_HOSTS = new Set([
  "api.paypal.com",
  "api.sandbox.paypal.com",
]);
export const CERT_FETCH_TIMEOUT_MS = 5000;

// reject deliveries timestamped more than 5 minutes from now, so a captured
// one can't be replayed later
export const TRANSMISSION_TIME_TOLERANCE_MS = 5 * 60 * 1000;

// the Webhooks Simulator always signs with this ID, and anyone can point it at
// any URL, so it's only trusted in dev mode
// https://developer.paypal.com/api/rest/webhooks/rest/#test-the-listener-with-mock-events
export const SIMULATOR_WEBHOOK_ID = "WEBHOOK_ID";

// the PayPal CLI signs the same message shape as PayPal, with this audience in
// place of the webhook ID, as "v1=" + a Base64 HMAC-SHA256
export const CLI_SIGNATURE_AUDIENCE = "PAYPALCLIDEVWEBHOOKV1";

// sample-scope dedupe: an in-memory, bounded set is enough for a single local
// dev process. A production handler would use a persistent store.
export const MAX_TRACKED_EVENT_IDS = 1000;

export const NOT_VERIFIED: VerifyPayPalWebhookResult = {
  verified: false,
  eventFidelity: undefined,
};
