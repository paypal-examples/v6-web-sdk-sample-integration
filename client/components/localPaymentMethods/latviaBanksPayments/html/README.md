# Latvia Banks One-Time Payment Integration

This example demonstrates how to implement Latvia Banks one-time payments using the PayPal v6 Web SDK.

## Payment method details

| Property                | Value                                    |
| ----------------------- | ---------------------------------------- |
| Currency                | `EUR`                                    |
| Buyer country (sandbox) | Latvia (`LV`)                            |
| SDK component           | `latviabanks-payments`                   |
| Eligibility key         | `latvia_banks`                           |
| Session method          | `createLatviaBanksOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `LV` and `currencyCode` to `EUR`, and enable **Latvia Banks** on your sandbox merchant account. The button only renders when the SDK reports **Latvia Banks** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
