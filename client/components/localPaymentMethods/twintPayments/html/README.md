# Twint One-Time Payment Integration

This example demonstrates how to integrate Twint payments using PayPal's v6 Web SDK. Twint is a popular mobile payment method in Switzerland that allows customers to authorize payments instantly from their banking app.

## Payment method details

| Property                | Value                              |
| ----------------------- | ---------------------------------- |
| Currency                | `CHF`                              |
| Buyer country (sandbox) | Switzerland (`CH`)                 |
| SDK component           | `twint-payments`                   |
| Eligibility key         | `twint`                            |
| Session method          | `createTwintOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `CH` and `currencyCode` to `CHF`, and enable **Twint** on your sandbox merchant account. The button only renders when the SDK reports **Twint** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
