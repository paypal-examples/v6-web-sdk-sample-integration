# Indomaret One-Time Payment Integration

This example demonstrates how to integrate Indomaret payments using PayPal's v6 Web SDK. Indomaret is an Indonesian over-the-counter payment method that allows customers to pay for online purchases at Indomaret convenience stores.

## Payment method details

| Property                | Value                                  |
| ----------------------- | -------------------------------------- |
| Currency                | `IDR`                                  |
| Buyer country (sandbox) | Indonesia (`ID`)                       |
| SDK component           | `indomaret-payments`                   |
| Eligibility key         | `indomaret`                            |
| Session method          | `createIndomaretOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `ID` and `currencyCode` to `IDR`, and enable **Indomaret** on your sandbox merchant account. The button only renders when the SDK reports **Indomaret** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
