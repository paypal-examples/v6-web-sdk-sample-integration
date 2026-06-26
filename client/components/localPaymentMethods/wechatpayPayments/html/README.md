# WechatPay One-Time Payment Integration

This example demonstrates how to integrate WechatPay payments using PayPal's v6 Web SDK. WechatPay is a popular mobile payment method in China that allows customers to authorize payments instantly through their banking app.

## Payment method details

| Property                | Value                                  |
| ----------------------- | -------------------------------------- |
| Currency                | `CNY`                                  |
| Buyer country (sandbox) | China (`CN`)                           |
| SDK component           | `wechatpay-payments`                   |
| Eligibility key         | `wechatpay`                            |
| Session method          | `createWechatpayOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `CN` and `currencyCode` to `CNY`, and enable **WechatPay** on your sandbox merchant account. The button only renders when the SDK reports **WechatPay** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
