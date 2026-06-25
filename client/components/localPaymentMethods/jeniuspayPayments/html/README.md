# Jeniuspay One-Time Payment Integration

This example demonstrates how to integrate Jeniuspay payments using PayPal's v6 Web SDK. Jenius Pay is an Indonesian digital banking payment method by BTPN that allows customers to pay using their Jenius account.

## Architecture Overview

1. Initialize PayPal Web SDK with the Jeniuspay component
2. Check eligibility for Jeniuspay payment method
3. Create Jeniuspay payment session with required payment fields
4. Validate customer name, email, and phone number
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through Jeniuspay popup flow
7. Handle payment approval, cancellation, and errors

## Features

- Jeniuspay one-time payment integration
- Full name and email field validation via PayPal SDK payment fields
- Phone number input (country code + national number)
- Popup payment flow
- Eligibility checking for Jeniuspay
- Error handling and user feedback
- IDR (Indonesian Rupiah) currency support

## Prerequisites

### 1. PayPal Developer Account Setup

1. **PayPal Developer Account** — Visit [developer.paypal.com](https://developer.paypal.com)
2. **Create a PayPal Application** — Note your **Client ID** and **Secret key**
3. **Enable Jeniuspay** — In [sandbox.paypal.com](https://www.sandbox.paypal.com), go to **Account Settings** → **Payment methods**, enable Jeniuspay, and configure **IDR** currency

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

Jeniuspay is available in Indonesia (ID).

### Client-Side Flow

1. **SDK Initialization**: `testBuyerCountry` is `"ID"`, component `jeniuspay-payments`.
2. **Eligibility Check**: `isEligible("jenius_pay")` with IDR currency.
3. **Session Creation**: `createJeniuspayOneTimePaymentSession`.
4. **Field Setup**: Mounts full name and email fields; reveals phone number inputs.
5. **Order & Payment Flow**: Creates order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` and IDR currency. Phone number passed alongside order ID.
6. **Completion**: Fetches order details via `/paypal-api/checkout/orders/:orderId`.

### Server-Side Requirements

- `GET /paypal-api/auth/browser-safe-client-id`
- `POST /paypal-api/checkout/orders/create-order-for-one-time-payment` (IDR + `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`)
- `GET /paypal-api/checkout/orders/:orderId`

## Troubleshooting

- Verify `testBuyerCountry` is `"ID"` and `currencyCode` is `"IDR"`
- Ensure Jeniuspay is enabled in PayPal sandbox account settings
- Ensure phone country code (`62`) and national number are filled in

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
