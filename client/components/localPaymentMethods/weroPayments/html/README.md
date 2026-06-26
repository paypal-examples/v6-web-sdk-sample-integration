# Wero One-Time Payment Integration

This example demonstrates how to integrate Wero payments using PayPal's v6 Web SDK. Wero is a popular mobile payment method in Germany and other European countries that allows customers to authorize payments instantly through their banking app.

## Payment method details

| Property                | Value                             |
| ----------------------- | --------------------------------- |
| Currency                | `EUR`                             |
| Buyer country (sandbox) | Germany (`DE`)                    |
| SDK component           | `wero-payments`                   |
| Eligibility key         | `wero`                            |
| Session method          | `createWeroOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `DE` and `currencyCode` to `EUR`, and enable **Wero** on your sandbox merchant account. The button only renders when the SDK reports **Wero** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
