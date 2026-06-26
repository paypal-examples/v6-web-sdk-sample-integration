# LinkAja One-Time Payment Integration

This example demonstrates how to integrate LinkAja payments using PayPal's v6 Web SDK. LinkAja is an Indonesian digital payment service backed by state-owned enterprises, allowing customers to pay using their LinkAja e-wallet.

## Payment method details

| Property                | Value                                |
| ----------------------- | ------------------------------------ |
| Currency                | `IDR`                                |
| Buyer country (sandbox) | Indonesia (`ID`)                     |
| SDK component           | `linkaja-payments`                   |
| Eligibility key         | `linkaja`                            |
| Session method          | `createLinkajaOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `ID` and `currencyCode` to `IDR`, and enable **LinkAja** on your sandbox merchant account. The button only renders when the SDK reports **LinkAja** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
