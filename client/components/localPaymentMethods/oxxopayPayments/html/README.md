# OxxoPay One-Time Payment Integration

This example demonstrates how to integrate OxxoPay payments using PayPal's v6 Web SDK. OxxoPay is a popular cash-based, voucher payment method in Mexico that lets customers pay for online purchases at OXXO convenience stores.

## Architecture Overview

This sample demonstrates a complete OxxoPay integration flow:

1. Initialize PayPal Web SDK with the OxxoPay component
2. Check eligibility for the OxxoPay payment method
3. Create an OxxoPay payment session with the required payment fields
4. Validate the customer name, email, and expiry date before initiating payment
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through the OxxoPay popup flow
7. Handle payment approval, cancellation, and errors

## Features

- OxxoPay one-time payment integration
- Full name and email field validation via PayPal SDK payment fields
- Voucher expiry date selection
- Popup payment flow
- Eligibility checking for OxxoPay
- Error handling and user feedback
- MXN (Mexican Peso) currency support

## Prerequisites

Before running this demo, you'll need to set up accounts and configure your development environment.

### 1. PayPal Developer Account Setup

1. **PayPal Developer Account**
   - Visit [developer.paypal.com](https://developer.paypal.com)
   - Sign up for a developer account or log in with existing credentials
   - Navigate to the **Apps & Credentials** section in your dashboard

2. **Create a PayPal Application** (or configure the default application)
   - Click **Create App**
   - Name your app
   - Select **Merchant** under **Type**
   - Choose the **Sandbox** account for testing
   - Click **Create App** at the bottom of the modal
   - Note your **Client ID** and **Secret key** under **API credentials** for later configuration of the `.env` file

3. **Enable OxxoPay Payment**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Navigate to **Account Settings** by clicking the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
   - Find **OxxoPay** in the payment methods and enable it
   - Ensure your account is configured to accept **MXN (Mexican Peso)** currency

### 2. System Requirements

- Node.js version 20 or higher
- Server running on port 8080 (see `server/node/` directory)

## Running the Demo

### Server Setup

1. **Navigate to the server directory:**

   ```bash
   cd server/node
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory using your client credentials from the previous Create Application step:

   ```env
   PAYPAL_SANDBOX_CLIENT_ID=your_paypal_sandbox_client_id
   PAYPAL_SANDBOX_CLIENT_SECRET=your_paypal_sandbox_client_secret
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:8080`

## How It Works

### Geographic Availability

OxxoPay is available to buyers in Mexico.

### Client-Side Flow

1. **SDK Initialization**: Loads PayPal Web SDK with the OxxoPay component using a client ID fetched from the server's `/paypal-api/auth/browser-safe-client-id` endpoint. `testBuyerCountry` is set to `"MX"` for sandbox testing.
2. **Eligibility Check**: Verifies OxxoPay is eligible for the merchant with MXN currency.
3. **Session Creation**: Creates an OxxoPay payment session (`createOxxopayOneTimePaymentSession`) with event callbacks for handling payment lifecycle events.
4. **Field Setup**: Mounts the required full name and email fields provided by the SDK, and shows the voucher expiry date field.
5. **Validation**: Validates the expiry date and the SDK payment fields before initiating the payment flow.
6. **Order & Payment Flow**: Opens a popup window where the customer authorizes the payment through OxxoPay. The order is created server-side via `/paypal-api/checkout/orders/create-order-for-one-time-payment` with the `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction, and the selected expiry date is passed in the session options.
7. **Completion**: Processes the payment result by fetching order details via `/paypal-api/checkout/orders/:orderId` (order is auto-completed due to processing instruction), or handles cancellation and error scenarios appropriately.

### Server-Side Requirements

The integration requires these endpoints (provided by the API server):

- `GET /paypal-api/auth/browser-safe-client-id` - Return client ID
- `POST /paypal-api/checkout/orders/create-order-for-one-time-payment` - Create order with MXN currency and `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
- `GET /paypal-api/checkout/orders/:orderId` - Fetch order details after approval

### Special Order Configuration

OxxoPay requires an order creation payload with:

- `processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL"` — the order is auto-completed on approval, so no separate capture call is needed
- MXN (Mexican Peso) currency

The OxxoPay session options also include an `expiryDate`, which sets the deadline by which the customer must complete the voucher payment.

### Currency Configuration

OxxoPay requires:

- MXN (Mexican Peso) currency
- Mexico (MX) as the buyer country

## Troubleshooting

### OxxoPay not eligible

- Verify `testBuyerCountry` is set to `"MX"`
- Check that `currencyCode` is set to `"MXN"` (Mexican Peso)
- Ensure OxxoPay is enabled for the merchant in PayPal account settings
- Verify your PayPal account is configured to accept MXN currency

### Validation fails

- Ensure the full name and email fields are properly mounted with JavaScript
- Check that the name and email fields have valid input
- Ensure the expiry date field has been filled in
- Ensure the fields are visible in the DOM

### Payment popup doesn't open

- Check for popup blockers
- Verify order creation returns a valid orderId
- Ensure proper event handler setup
- Check browser console for errors

### Order creation fails

- Verify API server is running on port 8080
- Check server logs for errors
- **Ensure currency_code is set to `"MXN"`** — this is critical for OxxoPay

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
