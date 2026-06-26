# P24 (Przelewy24) One-Time Payment Integration

This example demonstrates how to integrate P24 (Przelewy24) payments using PayPal's v6 Web SDK. Przelewy24 is one of the most popular payment methods in Poland that allows customers to pay directly from their bank accounts using online banking.

## Payment method details

| Property                | Value                            |
| ----------------------- | -------------------------------- |
| Currency                | `PLN`                            |
| Buyer country (sandbox) | Poland (`PL`)                    |
| SDK component           | `p24-payments`                   |
| Eligibility key         | `p24`                            |
| Session method          | `createP24OneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `PL` and `currencyCode` to `PLN`, and enable **P24 (Przelewy24)** on your sandbox merchant account. The button only renders when the SDK reports **P24 (Przelewy24)** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
