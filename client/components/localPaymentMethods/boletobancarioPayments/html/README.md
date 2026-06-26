# Boleto Bancario One-Time Payment Integration

This example demonstrates how to implement Boleto Bancario one-time payments using the PayPal v6 Web SDK.

## Payment method details

| Property                | Value                                       |
| ----------------------- | ------------------------------------------- |
| Currency                | `BRL`                                       |
| Buyer country (sandbox) | Brazil (`BR`)                               |
| SDK component           | `boletobancario-payments`                   |
| Eligibility key         | `boletobancario`                            |
| Session method          | `createBoletobancarioOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `BR` and `currencyCode` to `BRL`, and enable **Boleto Bancario** on your sandbox merchant account. The button only renders when the SDK reports **Boleto Bancario** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
