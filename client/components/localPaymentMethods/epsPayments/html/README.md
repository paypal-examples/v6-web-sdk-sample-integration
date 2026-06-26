# EPS One-Time Payment Integration

This example demonstrates how to integrate EPS payments using PayPal's v6 Web SDK. EPS (Electronic Payment Standard) is a popular payment method in Austria that allows customers to pay directly from their bank accounts.

## Payment method details

| Property                | Value                            |
| ----------------------- | -------------------------------- |
| Currency                | `EUR`                            |
| Buyer country (sandbox) | Austria (`AT`)                   |
| SDK component           | `eps-payments`                   |
| Eligibility key         | `eps`                            |
| Session method          | `createEpsOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `AT` and `currencyCode` to `EUR`, and enable **EPS** on your sandbox merchant account. The button only renders when the SDK reports **EPS** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
