# MBWay One-Time Payment Integration

This example demonstrates how to integrate MBWay payments using PayPal's v6 Web SDK. MBWay is a popular mobile payment method in Portugal that allows customers to authorize payments directly from their banking app using their registered phone number.

## Payment method details

| Property                | Value                              |
| ----------------------- | ---------------------------------- |
| Currency                | `EUR`                              |
| Buyer country (sandbox) | Portugal (`PT`)                    |
| SDK component           | `mbway-payments`                   |
| Eligibility key         | `mbway`                            |
| Session method          | `createMbWayOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `PT` and `currencyCode` to `EUR`, and enable **MBWay** on your sandbox merchant account. The button only renders when the SDK reports **MBWay** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
