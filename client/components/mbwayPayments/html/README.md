# MBWay One-Time Payment Integration

This example demonstrates how to integrate MBWay payments using PayPal's v6 Web SDK. MBWay is a popular mobile payment method in Portugal that allows customers to authorize payments directly from their banking app using their registered phone number.

## Architecture Overview

This sample demonstrates a complete MBWay integration flow:

1. Initialize PayPal Web SDK with the MBWay component
2. Check eligibility for MBWay payment method
3. Create MBWay payment session with required payment fields
4. Validate customer name, email, and phone number before initiating payment
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through MBWay popup flow
7. Handle payment approval, cancellation, and errors

## Features

- MBWay one-time payment integration
- Full name and email field validation via PayPal SDK payment fields
- Phone number input (country code + national number) for MBWay authorization
- Popup payment flow
- Eligibility checking for MBWay
- Error handling and user feedback
- EUR (Euro) currency support

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

3. **Enable MBWay Payment**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Navigate to **Account Settings** by clicking the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
   - Find **MBWay** in the payment methods and enable it
   - Ensure your account is configured to accept **EUR (Euro)** currency

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

### Client Setup

1. **Navigate to the MBWay demo directory:**

   ```bash
   cd client/components/mbwayPayments/html
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   The demo will be available at `http://localhost:3000`

## How It Works

### Geographic Availability

MBWay is available in Portugal.

### Client-Side Flow

1. **SDK Initialization**: Loads PayPal Web SDK core and the `mbway-payments` component using a client ID fetched from the server's `/paypal-api/auth/browser-safe-client-id` endpoint. `testBuyerCountry` is set to `"PT"` for sandbox testing.
2. **Eligibility Check**: Verifies MBWay is eligible for the merchant with EUR currency.
3. **Session Creation**: Creates an MBWay payment session (`createMbWayOneTimePaymentSession`) with event callbacks for handling payment lifecycle events.
4. **Field Setup**: Mounts the required full name and email fields provided by the SDK, and reveals the custom phone number inputs (country code + national number).
5. **Validation**: Validates SDK fields and phone number inputs before initiating the payment flow.
6. **Order & Payment Flow**: Opens a popup window where the customer authorizes the payment in their banking app. The order is created server-side via `/paypal-api/checkout/orders/create-order-for-one-time-payment` with the `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction. The phone number is passed alongside the order ID to the MBWay session.
7. **Completion**: Processes the payment result by fetching the order details via `/paypal-api/checkout/orders/:orderId` (order is auto-completed due to processing instruction), or handles cancellation and error scenarios appropriately.

### Key Difference from Other APMs

Unlike BLIK or P24, MBWay requires a **phone number** (country code + national number) as part of the payment authorization. This phone data is passed to `mbwayCheckout.start()` alongside the order ID. The order must also be created with `processing_instruction: ORDER_COMPLETE_ON_PAYMENT_APPROVAL`.

### Server-Side Requirements

The integration requires these endpoints (provided by the API server):

- `GET /paypal-api/auth/browser-safe-client-id` - Return client ID
- `POST /paypal-api/checkout/orders/create-order-for-mbway-one-time-payment` - Create order with EUR currency and `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction

## Available Scripts

- `npm start` - Start Vite development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Troubleshooting

### MBWay not eligible

- Verify `testBuyerCountry` is set to `"PT"`
- Check that `currencyCode` is set to `"EUR"` (Euro)
- Ensure MBWay is enabled for the merchant in PayPal account settings
- Verify your PayPal account is configured to accept EUR currency

### Validation fails

- Ensure both full name and email fields are properly mounted with JavaScript
- Check that both fields have valid input
- Verify email format is correct
- Ensure phone country code and national number fields are filled in
- Ensure fields are visible in the DOM

### Payment popup doesn't open

- Check for popup blockers
- Verify order creation returns a valid orderId
- Ensure proper event handler setup
- Check browser console for errors
- Verify order is created with EUR currency

### Order creation fails

- Verify API server is running on port 8080
- Check server logs for errors
- Validate order payload format
- **Ensure currency_code is set to "EUR"** - this is critical for MBWay

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
