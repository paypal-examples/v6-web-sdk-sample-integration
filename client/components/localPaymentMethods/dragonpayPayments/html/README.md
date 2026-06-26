# Dragonpay One-Time Payment Integration

This example demonstrates how to implement Dragonpay one-time payments using the PayPal v6 Web SDK.

## Payment method details

| Property                | Value                                  |
| ----------------------- | -------------------------------------- |
| Currency                | `PHP`                                  |
| Buyer country (sandbox) | Philippines (`PH`)                     |
| SDK component           | `dragonpay-payments`                   |
| Eligibility key         | `dragonpay`                            |
| Session method          | `createDragonpayOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `PH` and `currencyCode` to `PHP`, and enable **Dragonpay** on your sandbox merchant account. The button only renders when the SDK reports **Dragonpay** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
