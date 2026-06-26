# BLIK Pay Later One-Time Payment Integration

This example demonstrates how to integrate BLIK Pay Later payments using PayPal's v6 Web SDK. BLIK Pay Later is a popular buy-now-pay-later payment method in Poland that allows customers to complete purchases and pay in installments.

## Payment method details

| Property                | Value                                     |
| ----------------------- | ----------------------------------------- |
| Currency                | `PLN`                                     |
| Buyer country (sandbox) | Poland (`PL`)                             |
| SDK component           | `blikpaylater-payments`                   |
| Eligibility key         | `blik_pay_later`                          |
| Session method          | `createBlikPayLaterOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `PL` and `currencyCode` to `PLN`, and enable **BLIK Pay Later** on your sandbox merchant account. The button only renders when the SDK reports **BLIK Pay Later** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
