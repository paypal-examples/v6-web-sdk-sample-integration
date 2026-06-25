# Kredivo One-Time Payment Integration

This example demonstrates how to integrate Kredivo payments using PayPal's v6 Web SDK. Kredivo is an Indonesian buy-now-pay-later payment method that allows customers to split purchases into installments.

## Architecture Overview

1. Initialize PayPal Web SDK with the Kredivo component
2. Check eligibility for Kredivo payment method
3. Create Kredivo payment session with required payment fields
4. Validate customer name, email, and phone number
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through Kredivo popup flow
7. Handle payment approval, cancellation, and errors

## Features

- Kredivo one-time payment integration
- Full name and email field validation via PayPal SDK payment fields
- Phone number input (country code + national number)
- Popup payment flow
- Eligibility checking for Kredivo
- Error handling and user feedback
- IDR (Indonesian Rupiah) currency support

## Prerequisites

### 1. PayPal Developer Account Setup

1. **PayPal Developer Account** — Visit [developer.paypal.com](https://developer.paypal.com)
2. **Create a PayPal Application** — Note your **Client ID** and **Secret key**
3. **Enable Kredivo** — In [sandbox.paypal.com](https://www.sandbox.paypal.com), go to **Account Settings** → **Payment methods**, enable Kredivo, and configure **IDR** currency

### 2. System Requirements

- Node.js version 20 or higher
- Server running on port 8080

## Running the Demo

1. `cd server/node`
2. `npm install`
3. Create `.env`:
   ```env
   PAYPAL_SANDBOX_CLIENT_ID=your_paypal_sandbox_client_id
   PAYPAL_SANDBOX_CLIENT_SECRET=your_paypal_sandbox_client_secret
   ```
4. `npm start` — runs on `http://localhost:8080`

## How It Works

### Geographic Availability

Kredivo is available in Indonesia (ID).

### Client-Side Flow

1. **SDK Initialization**: `testBuyerCountry` is set to `"ID"`, component `kredivo-payments`.
2. **Eligibility Check**: `isEligible("kredivo")` with IDR currency.
3. **Session Creation**: `createKredivoOneTimePaymentSession`.
4. **Field Setup**: Mounts full name and email fields; reveals phone number inputs.
5. **Order & Payment Flow**: Creates order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` and IDR currency. Phone number passed alongside order ID.
6. **Completion**: Fetches order details via `/paypal-api/checkout/orders/:orderId`.

### Server-Side Requirements

- `GET /paypal-api/auth/browser-safe-client-id`
- `POST /paypal-api/checkout/orders/create-order-for-one-time-payment` (IDR + `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`)
- `GET /paypal-api/checkout/orders/:orderId`

## Troubleshooting

- Verify `testBuyerCountry` is `"ID"` and `currencyCode` is `"IDR"`
- Ensure Kredivo is enabled in PayPal sandbox account settings
- Ensure phone country code (`62`) and national number are filled in

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
