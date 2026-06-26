# FPX One-Time Payment Integration

This example demonstrates how to integrate FPX payments using PayPal's v6 Web SDK. FPX (Financial Process Exchange) is Malaysia's national online banking payment scheme that allows customers to pay directly from their bank account.

## Payment method details

| Property                | Value                            |
| ----------------------- | -------------------------------- |
| Currency                | `MYR`                            |
| Buyer country (sandbox) | Malaysia (`MY`)                  |
| SDK component           | `fpx-payments`                   |
| Eligibility key         | `fpx`                            |
| Session method          | `createFpxOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `MY` and `currencyCode` to `MYR`, and enable **FPX** on your sandbox merchant account. The button only renders when the SDK reports **FPX** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
