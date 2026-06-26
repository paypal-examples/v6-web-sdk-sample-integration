# Klarna One-Time Payment Integration

This example demonstrates how to integrate Klarna payments using PayPal's v6 Web SDK. Klarna is a popular buy now, pay later (BNPL) payment method available across multiple countries that allows customers to split payments into installments.

## Payment method details

| Property                | Value                               |
| ----------------------- | ----------------------------------- |
| Currency                | `GBP`                               |
| Buyer country (sandbox) | United Kingdom (`GB`)               |
| SDK component           | `klarna-payments`                   |
| Eligibility key         | `klarna`                            |
| Session method          | `createKlarnaOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `GB` and `currencyCode` to `GBP`, and enable **Klarna** on your sandbox merchant account. The button only renders when the SDK reports **Klarna** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
