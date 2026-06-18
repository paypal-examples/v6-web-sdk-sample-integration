# Floa One-Time Payment Integration

This example demonstrates how to integrate Floa payments using PayPal's v6 Web SDK. Floa is a French buy-now-pay-later payment method that allows customers to split purchases into installments.

## Architecture Overview

1. Initialize PayPal Web SDK with the Floa component
2. Check eligibility for Floa payment method
3. Create Floa payment session with required payment fields
4. Validate customer name, date of birth, and number of installments
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through Floa popup flow
7. Handle payment approval, cancellation, and errors

## Features

- Floa one-time payment integration
- Full name field validation via PayPal SDK payment fields
- Date of birth and number of installments custom inputs
- Popup payment flow
- Eligibility checking for Floa
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

3. **Enable Floa**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Navigate to **Account Settings** → **Payment methods**
   - Find **Floa** and enable it
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

Floa is available in France (FR).

### Client-Side Flow

1. **SDK Initialization**: Loads PayPal Web SDK core and the `floa-payments` component. `testBuyerCountry` is set to `"FR"` for sandbox testing.
2. **Eligibility Check**: Verifies Floa is eligible using `isEligible("floa_pay")` with EUR currency.
3. **Session Creation**: Creates a session via `createFloaOneTimePaymentSession` with event callbacks.
4. **Field Setup**: Mounts the full name field provided by the SDK, and reveals custom date of birth and installments inputs.
5. **Validation**: Validates SDK fields and custom inputs before initiating payment.
6. **Order & Payment Flow**: Opens a popup where the customer completes the Floa payment. The order is created via `/paypal-api/checkout/orders/create-order-for-one-time-payment` with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`. `dateOfBirth` and `numberOfInstallments` are passed alongside the order ID.
7. **Completion**: Fetches order details via `/paypal-api/checkout/orders/:orderId` after approval.

### Key Fields

| Field                  | Description                               |
| ---------------------- | ----------------------------------------- |
| `dateOfBirth`          | Customer date of birth (required by Floa) |
| `numberOfInstallments` | Number of installments (e.g. 3)           |

### Server-Side Requirements

- `GET /paypal-api/auth/browser-safe-client-id` - Return client ID
- `POST /paypal-api/checkout/orders/create-order-for-one-time-payment` - Create order with EUR currency and `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`
- `GET /paypal-api/checkout/orders/:orderId` - Fetch order details after approval

## Troubleshooting

### Floa not eligible

- Verify `testBuyerCountry` is set to `"FR"`
- Check that `currencyCode` is set to `"EUR"`
- Ensure Floa is enabled in PayPal account settings

### Validation fails

- Ensure full name field is properly mounted
- Check that date of birth and number of installments are filled in

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
