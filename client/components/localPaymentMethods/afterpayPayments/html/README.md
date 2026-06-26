# Afterpay One-Time Payment Integration

This example demonstrates how to integrate Afterpay payments using PayPal's v6 Web SDK. Afterpay is a popular buy now, pay later (BNPL) payment method available across multiple countries that allows customers to split payments into installments.

## Payment method details

| Property                | Value                                 |
| ----------------------- | ------------------------------------- |
| Currency                | `AUD`                                 |
| Buyer country (sandbox) | Australia (`AU`)                      |
| SDK component           | `afterpay-payments`                   |
| Eligibility key         | `afterpay`                            |
| Session method          | `createAfterpayOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `AU` and `currencyCode` to `AUD`, and enable **Afterpay** on your sandbox merchant account. The button only renders when the SDK reports **Afterpay** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
