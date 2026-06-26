# Trustly One-Time Payment Integration

This example demonstrates how to integrate Trustly payments using PayPal's v6 Web SDK. Trustly is a popular mobile payment method in Sweden and other European countries that allows customers to authorize payments instantly through their banking app.

## Payment method details

| Property                | Value                                |
| ----------------------- | ------------------------------------ |
| Currency                | `SEK`                                |
| Buyer country (sandbox) | Sweden (`SE`)                        |
| SDK component           | `trustly-payments`                   |
| Eligibility key         | `trustly`                            |
| Session method          | `createTrustlyOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `SE` and `currencyCode` to `SEK`, and enable **Trustly** on your sandbox merchant account. The button only renders when the SDK reports **Trustly** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
