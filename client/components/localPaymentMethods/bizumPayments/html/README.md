# Bizum One-Time Payment Integration

This example demonstrates how to integrate Bizum payments using PayPal's v6 Web SDK. Bizum is a popular mobile payment method in Spain that allows customers to authorize payments instantly from their banking app using their registered phone number.

## Payment method details

| Property                | Value                              |
| ----------------------- | ---------------------------------- |
| Currency                | `EUR`                              |
| Buyer country (sandbox) | Spain (`ES`)                       |
| SDK component           | `bizum-payments`                   |
| Eligibility key         | `bizum`                            |
| Session method          | `createBizumOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `ES` and `currencyCode` to `EUR`, and enable **Bizum** on your sandbox merchant account. The button only renders when the SDK reports **Bizum** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
