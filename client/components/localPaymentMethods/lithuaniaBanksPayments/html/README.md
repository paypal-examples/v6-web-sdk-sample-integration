# Lithuania Banks One-Time Payment Integration

This example demonstrates how to implement Lithuania Banks one-time payments using the PayPal v6 Web SDK.

## Payment method details

| Property                | Value                                       |
| ----------------------- | ------------------------------------------- |
| Currency                | `EUR`                                       |
| Buyer country (sandbox) | Lithuania (`LT`)                            |
| SDK component           | `lithuaniabanks-payments`                   |
| Eligibility key         | `lithuania_banks`                           |
| Session method          | `createLithuaniaBanksOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `LT` and `currencyCode` to `EUR`, and enable **Lithuania Banks** on your sandbox merchant account. The button only renders when the SDK reports **Lithuania Banks** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
