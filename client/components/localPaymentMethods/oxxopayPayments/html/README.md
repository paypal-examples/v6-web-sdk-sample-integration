# OxxoPay One-Time Payment Integration

This example demonstrates how to integrate OxxoPay payments using PayPal's v6 Web SDK. OxxoPay is a popular cash-based, voucher payment method in Mexico that lets customers pay for online purchases at OXXO convenience stores.

## Payment method details

| Property                | Value                                |
| ----------------------- | ------------------------------------ |
| Currency                | `MXN`                                |
| Buyer country (sandbox) | Mexico (`MX`)                        |
| SDK component           | `oxxopay-payments`                   |
| Eligibility key         | `oxxo_pay`                           |
| Session method          | `createOxxopayOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `MX` and `currencyCode` to `MXN`, and enable **OxxoPay** on your sandbox merchant account. The button only renders when the SDK reports **OxxoPay** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
