/*
 * How a verified event was signed:
 * - paypal_sandbox_signed: by PayPal, for your webhook ID
 * - paypal_simulator_signed: by PayPal's Webhooks Simulator (dev mode only)
 * - local_mock: by the PayPal CLI's dev secret (dev mode only)
 */
export type EventFidelity =
  "paypal_sandbox_signed" | "paypal_simulator_signed" | "local_mock";

export interface VerifyPayPalWebhookResult {
  verified: boolean;
  eventFidelity: EventFidelity | undefined;
}

export interface PayPalSignature {
  cert: string;
  signature: string;
}

/** The fields of a webhook event the handler reads. */
export interface WebhookEvent {
  id: string;
  event_type: string;
}

/** One event in the webhook inbox, in the shape the shared component reads. */
export interface InboxEvent {
  id: string;
  type: string;
  receivedAt: string;
  // masked; see maskWebhookPayload.ts
  payload: Record<string, unknown>;
}
