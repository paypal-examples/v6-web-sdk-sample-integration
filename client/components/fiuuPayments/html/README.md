# FIUU Cash One-Time Payment Integration

This example demonstrates how to integrate FIUU Cash payments using PayPal's v6 Web SDK. FIUU Cash (formerly Razer Merchant Services) is a Malaysian payment solution offering cash payment options at physical retail locations.

## Architecture Overview

1. Initialize PayPal Web SDK with the FIUU Cash component
2. Check eligibility for FIUU Cash payment method
3. Create FIUU Cash payment session with required payment fields
4. Validate customer name before initiating payment
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through FIUU Cash popup flow
7. Handle payment approval, cancellation, and errors

## Features

- FIUU Cash one-time payment integration
- Full name field validation via PayPal SDK payment fields
- Popup payment flow
- Eligibility checking for FIUU Cash
- Error handling and user feedback
- MYR (Malaysian Ringgit) currency support

## Prerequisites

### 1. PayPal Developer Account Setup

1. **PayPal Developer Account** — Visit [developer.paypal.com](https://developer.paypal.com)
2. **Create a PayPal Application** — Note your **Client ID** and **Secret key**
3. **Enable FIUU Cash** — In [sandbox.paypal.com](https://www.sandbox.paypal.com), go to **Account Settings** → **Payment methods**, enable FIUU Cash, and configure **MYR** currency

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

FIUU Cash is available in Malaysia (MY).

### Client-Side Flow

1. **SDK Initialization**: `testBuyerCountry` is `"MY"`, component `fiuu-cash-payments`.
2. **Eligibility Check**: `isEligible("fiuu_cash")` with MYR currency.
3. **Session Creation**: `createFIUUOneTimePaymentSession`.
4. **Field Setup**: Mounts the full name field provided by the SDK.
5. **Order & Payment Flow**: Creates order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` and MYR currency. Returns `{ orderId }`.
6. **Completion**: Fetches order details via `/paypal-api/checkout/orders/:orderId`.

### Server-Side Requirements

- `GET /paypal-api/auth/browser-safe-client-id`
- `POST /paypal-api/checkout/orders/create-order-for-one-time-payment` (MYR + `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`)
- `GET /paypal-api/checkout/orders/:orderId`

## Troubleshooting

- Verify `testBuyerCountry` is `"MY"` and `currencyCode` is `"MYR"`
- Ensure FIUU Cash is enabled in PayPal sandbox account settings
- Ensure the full name field is filled in

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
