# LinkAja One-Time Payment Integration

This example demonstrates how to integrate LinkAja payments using PayPal's v6 Web SDK. LinkAja is an Indonesian digital payment service backed by state-owned enterprises, allowing customers to pay using their LinkAja e-wallet.

## Architecture Overview

1. Initialize PayPal Web SDK with the LinkAja component
2. Check eligibility for LinkAja payment method
3. Create LinkAja payment session with required payment fields
4. Validate customer name, email, and phone number
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through LinkAja popup flow
7. Handle payment approval, cancellation, and errors

## Features

- LinkAja one-time payment integration
- Full name and email field validation via PayPal SDK payment fields
- Phone number input (country code + national number)
- Popup payment flow
- Eligibility checking for LinkAja
- Error handling and user feedback
- IDR (Indonesian Rupiah) currency support

## Prerequisites

### 1. PayPal Developer Account Setup

1. **PayPal Developer Account** — Visit [developer.paypal.com](https://developer.paypal.com)
2. **Create a PayPal Application** — Note your **Client ID** and **Secret key**
3. **Enable LinkAja** — In [sandbox.paypal.com](https://www.sandbox.paypal.com), go to **Account Settings** → **Payment methods**, enable LinkAja, and configure **IDR** currency

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

LinkAja is available in Indonesia (ID).

### Client-Side Flow

1. **SDK Initialization**: `testBuyerCountry` is `"ID"`, component `linkaja-payments`.
2. **Eligibility Check**: `isEligible("linkaja")` with IDR currency.
3. **Session Creation**: `createLinkajaOneTimePaymentSession`.
4. **Field Setup**: Mounts full name and email fields; reveals phone number inputs.
5. **Order & Payment Flow**: Creates order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` and IDR currency. Phone number passed alongside order ID.
6. **Completion**: Fetches order details via `/paypal-api/checkout/orders/:orderId`.

### Server-Side Requirements

- `GET /paypal-api/auth/browser-safe-client-id`
- `POST /paypal-api/checkout/orders/create-order-for-one-time-payment` (IDR + `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`)
- `GET /paypal-api/checkout/orders/:orderId`

## Troubleshooting

- Verify `testBuyerCountry` is `"ID"` and `currencyCode` is `"IDR"`
- Ensure LinkAja is enabled in PayPal sandbox account settings
- Ensure phone country code (`62`) and national number are filled in

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
