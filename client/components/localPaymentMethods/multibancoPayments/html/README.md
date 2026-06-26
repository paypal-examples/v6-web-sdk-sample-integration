# Multibanco One-Time Payment Integration

This example demonstrates how to integrate Multibanco payments using PayPal's v6 Web SDK. Multibanco is a popular mobile payment method in Portugal and other European countries that allows customers to authorize payments instantly through their banking app.

## Payment method details

| Property                | Value                                   |
| ----------------------- | --------------------------------------- |
| Currency                | `EUR`                                   |
| Buyer country (sandbox) | Portugal (`PT`)                         |
| SDK component           | `multibanco-payments`                   |
| Eligibility key         | `multibanco`                            |
| Session method          | `createMultibancoOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `PT` and `currencyCode` to `EUR`, and enable **Multibanco** on your sandbox merchant account. The button only renders when the SDK reports **Multibanco** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
