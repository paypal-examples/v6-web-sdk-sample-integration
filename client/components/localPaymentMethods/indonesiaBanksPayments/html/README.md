# Indonesia Banks One-Time Payment Integration

This example demonstrates how to integrate Indonesia Banks payments using PayPal's v6 Web SDK. Indonesia Banks enables customers to pay via Indonesian bank transfer methods including virtual accounts from major Indonesian banks.

## Payment method details

| Property                | Value                                       |
| ----------------------- | ------------------------------------------- |
| Currency                | `IDR`                                       |
| Buyer country (sandbox) | Indonesia (`ID`)                            |
| SDK component           | `indonesiabanks-payments`                   |
| Eligibility key         | `indonesia_banks`                           |
| Session method          | `createIndonesiaBanksOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `ID` and `currencyCode` to `IDR`, and enable **Indonesia Banks** on your sandbox merchant account. The button only renders when the SDK reports **Indonesia Banks** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
