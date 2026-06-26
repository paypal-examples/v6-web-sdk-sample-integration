# OVO One-Time Payment Integration

This example demonstrates how to integrate OVO payments using PayPal's v6 Web SDK. OVO is a popular Indonesian digital wallet that allows customers to pay for online purchases using their OVO balance.

## Payment method details

| Property                | Value                            |
| ----------------------- | -------------------------------- |
| Currency                | `IDR`                            |
| Buyer country (sandbox) | Indonesia (`ID`)                 |
| SDK component           | `ovo-payments`                   |
| Eligibility key         | `ovo`                            |
| Session method          | `createOvoOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `ID` and `currencyCode` to `IDR`, and enable **OVO** on your sandbox merchant account. The button only renders when the SDK reports **OVO** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
