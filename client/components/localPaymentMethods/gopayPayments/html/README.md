# GoPay One-Time Payment Integration

This example demonstrates how to integrate GoPay payments using PayPal's v6 Web SDK. GoPay is Indonesia's leading digital wallet by Gojek, allowing customers to pay using their GoPay balance.

## Payment method details

| Property                | Value                              |
| ----------------------- | ---------------------------------- |
| Currency                | `IDR`                              |
| Buyer country (sandbox) | Indonesia (`ID`)                   |
| SDK component           | `gopay-payments`                   |
| Eligibility key         | `gopay`                            |
| Session method          | `createGopayOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `ID` and `currencyCode` to `IDR`, and enable **GoPay** on your sandbox merchant account. The button only renders when the SDK reports **GoPay** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
