# Verkkopankki One-Time Payment Integration

This example demonstrates how to integrate Verkkopankki payments using PayPal's v6 Web SDK. Verkkopankki is a popular mobile payment method in Finland and other European countries that allows customers to authorize payments instantly through their banking app.

## Payment method details

| Property                | Value                                     |
| ----------------------- | ----------------------------------------- |
| Currency                | `EUR`                                     |
| Buyer country (sandbox) | Finland (`FI`)                            |
| SDK component           | `verkkopankki-payments`                   |
| Eligibility key         | `verkkopankki`                            |
| Session method          | `createVerkkopankkiOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `FI` and `currencyCode` to `EUR`, and enable **Verkkopankki** on your sandbox merchant account. The button only renders when the SDK reports **Verkkopankki** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
