# Scalapay One-Time Payment Integration

This example demonstrates how to integrate Scalapay payments using PayPal's v6 Web SDK. Scalapay is a buy-now-pay-later payment method available in France and Italy that allows customers to split purchases into installments.

## Architecture Overview

1. Initialize PayPal Web SDK with the Scalapay component
2. Check eligibility for Scalapay payment method
3. Create Scalapay payment session with required payment fields
4. Validate customer name, email, and phone number before initiating payment
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through Scalapay popup flow
7. Handle payment approval, cancellation, and errors

## Features

- Scalapay one-time payment integration
- Full name and email field validation via PayPal SDK payment fields
- Phone number input (country code + national number)
- Popup payment flow
- Eligibility checking for Scalapay
- Error handling and user feedback
- EUR (Euro) currency support

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

3. **Enable Scalapay**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Navigate to **Account Settings** → **Payment methods**
   - Find **Scalapay** and enable it
   - Ensure your account is configured to accept **EUR (Euro)**

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

Scalapay is available in France (FR) and Italy (IT).

### Client-Side Flow

1. **SDK Initialization**: Loads PayPal Web SDK core and the `scalapay-payments` component. `testBuyerCountry` is set to `"FR"` for sandbox testing.
2. **Eligibility Check**: Verifies Scalapay is eligible using `isEligible("scalapay")` with EUR currency.
3. **Session Creation**: Creates a session via `createScalapayOneTimePaymentSession` with event callbacks.
4. **Field Setup**: Mounts full name and email fields provided by the SDK, and reveals the phone number inputs.
5. **Validation**: Validates SDK fields and phone inputs before initiating payment.
6. **Order & Payment Flow**: Opens a popup where the customer completes the Scalapay payment. The order is created via `/paypal-api/checkout/orders/create-order-for-one-time-payment` with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`. The phone number is passed alongside the order ID.
7. **Completion**: Fetches order details via `/paypal-api/checkout/orders/:orderId` after approval.

### Server-Side Requirements

- `GET /paypal-api/auth/browser-safe-client-id` - Return client ID
- `POST /paypal-api/checkout/orders/create-order-for-one-time-payment` - Create order with EUR currency and `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`
- `GET /paypal-api/checkout/orders/:orderId` - Fetch order details after approval

## Troubleshooting

### Scalapay not eligible
- Verify `testBuyerCountry` is set to `"FR"` or `"IT"`
- Check that `currencyCode` is set to `"EUR"`
- Ensure Scalapay is enabled in PayPal account settings

### Validation fails
- Ensure full name and email fields are properly mounted
- Check that phone country code and national number are filled in

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
