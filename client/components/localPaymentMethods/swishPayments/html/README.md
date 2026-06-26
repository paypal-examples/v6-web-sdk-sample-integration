# Swish One-Time Payment Integration

This example demonstrates how to integrate Swish payments using PayPal's v6 Web SDK. Swish is a popular mobile payment method in Sweden that allows customers to authorize payments instantly from their banking app using their registered phone number.

## Payment method details

| Property                | Value                              |
| ----------------------- | ---------------------------------- |
| Currency                | `SEK`                              |
| Buyer country (sandbox) | Sweden (`SE`)                      |
| SDK component           | `swish-payments`                   |
| Eligibility key         | `swish`                            |
| Session method          | `createSwishOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `SE` and `currencyCode` to `SEK`, and enable **Swish** on your sandbox merchant account. The button only renders when the SDK reports **Swish** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
