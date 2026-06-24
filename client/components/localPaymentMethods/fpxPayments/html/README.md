# FPX One-Time Payment Integration

This example demonstrates how to integrate FPX payments using PayPal's v6 Web SDK. FPX (Financial Process Exchange) is Malaysia's national online banking payment scheme that allows customers to pay directly from their bank account.

## Architecture Overview

1. Initialize PayPal Web SDK with the FPX component
2. Check eligibility for FPX payment method
3. Create FPX payment session with required payment fields
4. Validate customer name before initiating payment
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through FPX popup flow
7. Handle payment approval, cancellation, and errors

## Features

- FPX one-time payment integration
- Full name field validation via PayPal SDK payment fields
- Popup payment flow
- Eligibility checking for FPX
- Error handling and user feedback
- MYR (Malaysian Ringgit) currency support

## Prerequisites

### 1. PayPal Developer Account Setup

1. **PayPal Developer Account** — Visit [developer.paypal.com](https://developer.paypal.com)
2. **Create a PayPal Application** — Note your **Client ID** and **Secret key**
3. **Enable FPX** — In [sandbox.paypal.com](https://www.sandbox.paypal.com), go to **Account Settings** → **Payment methods**, enable FPX, and configure **MYR** currency

### 2. System Requirements

- Node.js version 20 or higher
- Server running on port 8080

## Running the Demo

1. `cd server/node` → `npm install`
2. Create `.env`:
   ```env
   PAYPAL_SANDBOX_CLIENT_ID=your_paypal_sandbox_client_id
   PAYPAL_SANDBOX_CLIENT_SECRET=your_paypal_sandbox_client_secret
   ```
3. `npm start` — runs on `http://localhost:8080`

## How It Works

### Geographic Availability

FPX is available in Malaysia (MY).

### Client-Side Flow

1. **SDK Initialization**: `testBuyerCountry` is `"MY"`, component `fpx-payments`.
2. **Eligibility Check**: `isEligible("fpx")` with MYR currency.
3. **Session Creation**: `createFpxOneTimePaymentSession`.
4. **Field Setup**: Mounts the full name field provided by the SDK.
5. **Order & Payment Flow**: Creates order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` and MYR currency. Returns `{ orderId }`.
6. **Completion**: Fetches order details via `/paypal-api/checkout/orders/:orderId`.

### Server-Side Requirements

- `GET /paypal-api/auth/browser-safe-client-id`
- `POST /paypal-api/checkout/orders/create-order-for-one-time-payment` (MYR + `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`)
- `GET /paypal-api/checkout/orders/:orderId`

## Troubleshooting

- Verify `testBuyerCountry` is `"MY"` and `currencyCode` is `"MYR"`
- Ensure FPX is enabled in PayPal sandbox account settings
- Ensure the full name field is filled in

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
