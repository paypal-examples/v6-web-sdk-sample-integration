# PayU One-Time Payment Integration

This example demonstrates how to integrate PayU payments using PayPal's v6 Web SDK. PayU is a popular buy now, pay later (BNPL) payment method available across multiple countries that allows customers to split payments into installments.

## Payment method details

| Property                | Value                             |
| ----------------------- | --------------------------------- |
| Currency                | `PLN`                             |
| Buyer country (sandbox) | Poland (`PL`)                     |
| SDK component           | `payu-payments`                   |
| Eligibility key         | `payu`                            |
| Session method          | `createPayuOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `PL` and `currencyCode` to `PLN`, and enable **PayU** on your sandbox merchant account. The button only renders when the SDK reports **PayU** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
