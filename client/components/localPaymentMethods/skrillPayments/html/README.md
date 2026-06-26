# Skrill One-Time Payment Integration

This example demonstrates how to integrate Skrill payments using PayPal's v6 Web SDK. Skrill is a popular digital wallet and payment method in Europe that allows customers to pay securely online.

## Payment method details

| Property                | Value                               |
| ----------------------- | ----------------------------------- |
| Currency                | `EUR`                               |
| Buyer country (sandbox) | Germany (`DE`)                      |
| SDK component           | `skrill-payments`                   |
| Eligibility key         | `skrill`                            |
| Session method          | `createSkrillOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `DE` and `currencyCode` to `EUR`, and enable **Skrill** on your sandbox merchant account. The button only renders when the SDK reports **Skrill** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
