# FIUU Cash One-Time Payment Integration

This example demonstrates how to integrate FIUU Cash payments using PayPal's v6 Web SDK. FIUU Cash (formerly Razer Merchant Services) is a Malaysian payment solution offering cash payment options at physical retail locations.

## Payment method details

| Property                | Value                             |
| ----------------------- | --------------------------------- |
| Currency                | `MYR`                             |
| Buyer country (sandbox) | Malaysia (`MY`)                   |
| SDK component           | `fiuu-cash-payments`              |
| Eligibility key         | `fiuu_cash`                       |
| Session method          | `createFIUUOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `MY` and `currencyCode` to `MYR`, and enable **FIUU Cash** on your sandbox merchant account. The button only renders when the SDK reports **FIUU Cash** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
