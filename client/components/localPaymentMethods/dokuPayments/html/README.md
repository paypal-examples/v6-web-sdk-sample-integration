# DOKU One-Time Payment Integration

This example demonstrates how to integrate DOKU payments using PayPal's v6 Web SDK. DOKU is an Indonesian payment platform offering various payment methods including virtual accounts and e-wallets.

## Payment method details

| Property                | Value                             |
| ----------------------- | --------------------------------- |
| Currency                | `IDR`                             |
| Buyer country (sandbox) | Indonesia (`ID`)                  |
| SDK component           | `doku-payments`                   |
| Eligibility key         | `doku`                            |
| Session method          | `createDOKUOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `ID` and `currencyCode` to `IDR`, and enable **DOKU** on your sandbox merchant account. The button only renders when the SDK reports **DOKU** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
