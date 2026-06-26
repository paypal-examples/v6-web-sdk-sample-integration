# Scalapay One-Time Payment Integration

This example demonstrates how to integrate Scalapay payments using PayPal's v6 Web SDK. Scalapay is a buy-now-pay-later payment method available in France and Italy that allows customers to split purchases into installments.

## Payment method details

| Property                | Value                                 |
| ----------------------- | ------------------------------------- |
| Currency                | `EUR`                                 |
| Buyer country (sandbox) | France (`FR`)                         |
| SDK component           | `scalapay-payments`                   |
| Eligibility key         | `scalapay`                            |
| Session method          | `createScalapayOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `FR` and `currencyCode` to `EUR`, and enable **Scalapay** on your sandbox merchant account. The button only renders when the SDK reports **Scalapay** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
