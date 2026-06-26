# BLIK One-Time Payment Integration

This example demonstrates how to integrate BLIK payments using PayPal's v6 Web SDK. BLIK is a popular mobile payment method in Poland that allows customers to make instant payments in their mobile banking app.

## Payment method details

| Property                | Value                             |
| ----------------------- | --------------------------------- |
| Currency                | `PLN`                             |
| Buyer country (sandbox) | Poland (`PL`)                     |
| SDK component           | `blik-payments`                   |
| Eligibility key         | `blik`                            |
| Session method          | `createBlikOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `PL` and `currencyCode` to `PLN`, and enable **BLIK** on your sandbox merchant account. The button only renders when the SDK reports **BLIK** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
