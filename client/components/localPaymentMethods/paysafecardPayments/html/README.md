# Paysafecard One-Time Payment Integration

This example demonstrates how to integrate Paysafecard payments using PayPal's v6 Web SDK. Paysafecard is a popular prepaid payment method in Europe that allows customers to pay online using prepaid vouchers.

## Payment method details

| Property                | Value                                    |
| ----------------------- | ---------------------------------------- |
| Currency                | `EUR`                                    |
| Buyer country (sandbox) | Germany (`DE`)                           |
| SDK component           | `paysafecard-payments`                   |
| Eligibility key         | `paysafecard`                            |
| Session method          | `createPaysafecardOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `DE` and `currencyCode` to `EUR`, and enable **Paysafecard** on your sandbox merchant account. The button only renders when the SDK reports **Paysafecard** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
