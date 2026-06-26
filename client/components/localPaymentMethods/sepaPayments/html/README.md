# SEPA One-Time Payment Integration

This example demonstrates how to integrate SEPA (Single Euro Payments Area) direct debit payments using PayPal's v6 Web SDK, letting customers across the euro area pay directly from their bank account.

## Payment method details

| Property                | Value                             |
| ----------------------- | --------------------------------- |
| Currency                | `EUR`                             |
| Buyer country (sandbox) | Germany (`DE`)                    |
| SDK component           | `sepa-payments`                   |
| Eligibility key         | _n/a (no eligibility check)_      |
| Session method          | `createSepaOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `DE` and `currencyCode` to `EUR`, and enable **SEPA** on your sandbox merchant account. The button only renders when the SDK reports **SEPA** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
