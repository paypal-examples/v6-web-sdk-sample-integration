# Pix International One-Time Payment Integration

This example demonstrates how to integrate Pix International payments using PayPal's v6 Web SDK. Pix is Brazil's instant payment method operated by the Central Bank of Brazil, allowing customers to complete payments instantly using their banking app or QR code.

## Payment method details

| Property                | Value                                         |
| ----------------------- | --------------------------------------------- |
| Currency                | `BRL`                                         |
| Buyer country (sandbox) | Brazil (`BR`)                                 |
| SDK component           | `pix-international-payments`                  |
| Eligibility key         | `pix_international`                           |
| Session method          | `createPixInternationalOneTimePaymentSession` |

## Testing & eligibility

Set `testBuyerCountry` to `BR` and `currencyCode` to `BRL`, and enable **Pix International** on your sandbox merchant account. The button only renders when the SDK reports **Pix International** as eligible for your merchant account; otherwise the page shows a "not eligible" message.

## Common setup & flow

Setup, prerequisites, the end-to-end integration flow, server endpoints, and
troubleshooting are shared by every local payment method and documented once in
the [Local Payment Methods guide](../../README.md).
