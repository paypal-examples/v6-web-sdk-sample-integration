# BLIK Pay Later One-Time Payment Integration

This example demonstrates how to integrate BLIK Pay Later payments using PayPal's v6 Web SDK. BLIK Pay Later is a popular buy-now-pay-later payment method in Poland that allows customers to complete purchases and pay in installments.

## Architecture Overview

This sample demonstrates a complete BLIK Pay Later integration flow:

1. Initialize PayPal Web SDK with the BLIK Pay Later component
2. Check eligibility for BLIK Pay Later payment method
3. Create BLIK Pay Later payment session with required payment fields
4. Validate customer name before initiating payment
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through BLIK Pay Later popup flow
7. Handle payment approval, cancellation, and errors

## Features

- BLIK Pay Later one-time payment integration
- Full name field validation via PayPal SDK payment fields
- Popup payment flow
- Eligibility checking for BLIK Pay Later
- Error handling and user feedback
- PLN (Polish Zloty) currency support

## Prerequisites

### 1. PayPal Developer Account Setup

1. **PayPal Developer Account**
   - Visit [developer.paypal.com](https://developer.paypal.com)
   - Sign up for a developer account or log in with existing credentials
   - Navigate to the **Apps & Credentials** section in your dashboard

2. **Create a PayPal Application**
   - Click **Create App**, name your app, select **Merchant** under **Type**
   - Choose the **Sandbox** account for testing
   - Note your **Client ID** and **Secret key** for the `.env` file

3. **Enable BLIK Pay Later**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Navigate to **Account Settings** → **Payment methods**
   - Find **BLIK Pay Later** and enable it
   - Ensure your account is configured to accept **PLN (Polish Zloty)**

### 2. System Requirements

- Node.js version 20 or higher
- Server running on port 8080 (see `server/node/` directory)

## Running the Demo

1. **Navigate to the server directory:** `cd server/node`
2. **Install dependencies:** `npm install`
3. **Configure environment variables:**
   ```env
   PAYPAL_SANDBOX_CLIENT_ID=your_paypal_sandbox_client_id
   PAYPAL_SANDBOX_CLIENT_SECRET=your_paypal_sandbox_client_secret
   ```
4. **Start the server:** `npm start` — runs on `http://localhost:8080`

## How It Works

### Geographic Availability

BLIK Pay Later is available in Poland (PL).

### Client-Side Flow

1. **SDK Initialization**: Loads PayPal Web SDK core and the `blikpaylater-payments` component. `testBuyerCountry` is set to `"PL"` for sandbox testing.
2. **Eligibility Check**: Verifies BLIK Pay Later is eligible using `isEligible("blik_pay_later")` with PLN currency.
3. **Session Creation**: Creates a session via `createBlikPayLaterOneTimePaymentSession` with event callbacks.
4. **Field Setup**: Mounts the full name field provided by the SDK.
5. **Validation**: Validates SDK fields before initiating the payment flow.
6. **Order & Payment Flow**: Opens a popup where the customer completes the BLIK Pay Later payment. The order is created via `/paypal-api/checkout/orders/create-order-for-one-time-payment` with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`.
7. **Completion**: Fetches order details via `/paypal-api/checkout/orders/:orderId` after approval.

### Server-Side Requirements

- `GET /paypal-api/auth/browser-safe-client-id` - Return client ID
- `POST /paypal-api/checkout/orders/create-order-for-one-time-payment` - Create order with PLN currency and `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`
- `GET /paypal-api/checkout/orders/:orderId` - Fetch order details after approval

## Troubleshooting

### BLIK Pay Later not eligible

- Verify `testBuyerCountry` is set to `"PL"`
- Check that `currencyCode` is set to `"PLN"`
- Ensure BLIK Pay Later is enabled in PayPal account settings

### Payment popup doesn't open

- Check for popup blockers
- Verify order creation returns a valid orderId
- Check browser console for errors

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
