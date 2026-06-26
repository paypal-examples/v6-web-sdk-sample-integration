# Floa One-Time Payment Integration

This example demonstrates how to integrate Floa payments using PayPal's v6 Web SDK. Floa is a French buy-now-pay-later payment method that allows customers to split purchases into installments.

## Payment method details

| Property                | Value                             |
| ----------------------- | --------------------------------- |
| Currency                | `EUR`                             |
| Buyer country (sandbox) | France (`FR`)                     |
| SDK component           | `floa-payments`                   |
| Eligibility key         | `floa_pay`                        |
| Session method          | `createFloaOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `FR` and `currencyCode` to `EUR`, and enable **Floa** on your sandbox merchant account. The button only renders when the SDK reports **Floa** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
