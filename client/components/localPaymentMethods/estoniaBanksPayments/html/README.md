# Estonia Banks One-Time Payment Integration

This example demonstrates how to integrate Estonia Banks payments using PayPal's v6 Web SDK. Estonia Banks is a banking payment method available in Estonia that allows customers to pay using their local banks.

## Payment method details

| Property                | Value                                |
| ----------------------- | ------------------------------------ |
| Currency                | `EUR`                                |
| Buyer country (sandbox) | Estonia (`EE`)                       |
| SDK component           | `estoniabank-payments`               |
| Eligibility key         | `estonia_banks`                      |
| Session method          | `createEstoniaOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `EE` and `currencyCode` to `EUR`, and enable **Estonia Banks** on your sandbox merchant account. The button only renders when the SDK reports **Estonia Banks** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
