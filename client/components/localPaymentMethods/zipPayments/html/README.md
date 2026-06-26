# Zip One-Time Payment Integration

This example demonstrates how to integrate Zip payments using PayPal's v6 Web SDK. Zip is a popular buy now, pay later (BNPL) payment method available in Australia that allows customers to split payments into installments.

## Payment method details

| Property                | Value                            |
| ----------------------- | -------------------------------- |
| Currency                | `AUD`                            |
| Buyer country (sandbox) | Australia (`AU`)                 |
| SDK component           | `zip-payments`                   |
| Eligibility key         | `zip`                            |
| Session method          | `createZipOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `AU` and `currencyCode` to `AUD`, and enable **Zip** on your sandbox merchant account. The button only renders when the SDK reports **Zip** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
