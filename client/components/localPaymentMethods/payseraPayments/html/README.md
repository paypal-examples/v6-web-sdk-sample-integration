# Paysera One-Time Payment Integration

This example demonstrates how to implement Paysera one-time payments using the PayPal v6 Web SDK.

## Payment method details

| Property                | Value                                |
| ----------------------- | ------------------------------------ |
| Currency                | `EUR`                                |
| Buyer country (sandbox) | Lithuania (`LT`)                     |
| SDK component           | `paysera-payments`                   |
| Eligibility key         | `paysera`                            |
| Session method          | `createPayseraOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `LT` and `currencyCode` to `EUR`, and enable **Paysera** on your sandbox merchant account. The button only renders when the SDK reports **Paysera** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
