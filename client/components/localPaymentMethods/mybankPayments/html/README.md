# MyBank One-Time Payment Integration

This example demonstrates how to integrate MyBank payments using PayPal's v6 Web SDK. MyBank is a popular mobile payment method in Italy and other European countries that allows customers to authorize payments instantly through their banking app.

## Payment method details

| Property                | Value                               |
| ----------------------- | ----------------------------------- |
| Currency                | `EUR`                               |
| Buyer country (sandbox) | Italy (`IT`)                        |
| SDK component           | `mybank-payments`                   |
| Eligibility key         | `mybank`                            |
| Session method          | `createMyBankOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `IT` and `currencyCode` to `EUR`, and enable **MyBank** on your sandbox merchant account. The button only renders when the SDK reports **MyBank** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
