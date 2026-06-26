# Alipay One-Time Payment Integration

This example demonstrates how to integrate Alipay payments using PayPal's v6 Web SDK. Alipay is one of the most popular digital payment platforms in China, enabling customers to pay securely through their Alipay accounts.

## Payment method details

| Property                | Value                               |
| ----------------------- | ----------------------------------- |
| Currency                | `USD`                               |
| Buyer country (sandbox) | China (`CN`)                        |
| SDK component           | `alipay-payments`                   |
| Eligibility key         | `alipay`                            |
| Session method          | `createAlipayOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `CN` and `currencyCode` to `USD`, and enable **Alipay** on your sandbox merchant account. The button only renders when the SDK reports **Alipay** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
