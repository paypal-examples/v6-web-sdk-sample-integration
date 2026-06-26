# iDEAL One-Time Payment Integration

This example demonstrates how to integrate iDEAL payments using PayPal's v6 Web SDK. iDEAL is a popular payment method in the Netherlands that allows customers to pay directly from their bank accounts.

## Payment method details

| Property                | Value                              |
| ----------------------- | ---------------------------------- |
| Currency                | `EUR`                              |
| Buyer country (sandbox) | Netherlands (`NL`)                 |
| SDK component           | `ideal-payments`                   |
| Eligibility key         | `ideal`                            |
| Session method          | `createIdealOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `NL` and `currencyCode` to `EUR`, and enable **iDEAL** on your sandbox merchant account. The button only renders when the SDK reports **iDEAL** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
