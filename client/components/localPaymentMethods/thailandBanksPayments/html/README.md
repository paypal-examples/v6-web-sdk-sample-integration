# Thailand Banks One-Time Payment Integration

This example demonstrates how to integrate Thailand Banks payments using PayPal's v6 Web SDK. Thailand Banks is a popular payment method in Thailand that allows customers to pay using their local banking apps.

## Payment method details

| Property                | Value                                      |
| ----------------------- | ------------------------------------------ |
| Currency                | `THB`                                      |
| Buyer country (sandbox) | Thailand (`TH`)                            |
| SDK component           | `thailand-banks-payments`                  |
| Eligibility key         | `thailand_banks`                           |
| Session method          | `createThailandBanksOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `TH` and `currencyCode` to `THB`, and enable **Thailand Banks** on your sandbox merchant account. The button only renders when the SDK reports **Thailand Banks** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
