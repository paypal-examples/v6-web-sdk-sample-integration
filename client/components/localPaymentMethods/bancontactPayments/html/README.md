# Bancontact One-Time Payment Integration

This example demonstrates how to integrate Bancontact payments using PayPal's v6 Web SDK. Bancontact is the most popular payment method in Belgium that allows customers to pay directly from their bank accounts.

## Payment method details

| Property                | Value                                   |
| ----------------------- | --------------------------------------- |
| Currency                | `EUR`                                   |
| Buyer country (sandbox) | Belgium (`BE`)                          |
| SDK component           | `bancontact-payments`                   |
| Eligibility key         | `bancontact`                            |
| Session method          | `createBancontactOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `BE` and `currencyCode` to `EUR`, and enable **Bancontact** on your sandbox merchant account. The button only renders when the SDK reports **Bancontact** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
