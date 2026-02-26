# Scalapay One-Time Payment Integration

This example demonstrates how to integrate Scalapay payments using PayPal's v6 Web SDK. Scalapay is a popular Buy Now, Pay Later payment method that allows customers to split their purchase into interest-free installments.

## 🏗️ Architecture Overview

This sample demonstrates a complete Scalapay integration flow:

1. Initialize PayPal Web SDK with the Scalapay component
2. Check eligibility for Scalapay payment method
3. Create Scalapay payment session with required payment fields
4. Validate customer information (name, email, phone) before initiating payment
5. Authorize the payment through Scalapay popup flow
6. Handle payment approval, cancellation, and errors

## Features

- Scalapay one-time payment integration
- Full name, email, and phone number field validation
- Popup payment flow with Scalapay authorization
- Eligibility checking for Scalapay
- Error handling and user feedback
- EUR (Euro) currency support
- Custom order creation with processing instruction

## 📋 Prerequisites

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

3. **Enable Scalapay Payment**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Navigate to **Account Settings** by clicking the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
   - Find **Scalapay** in the payment methods and enable it
   - Ensure your account is configured to accept **EUR (Euro)** currency

### 2. System Requirements

- Node.js version 20 or higher
- Server running on port 8080 (see `server/node/` directory)

## 🚀 Running the Demo

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

1. **Navigate to the main page:**
   Open your browser and go to `http://localhost:8080`

2. **Select Scalapay Payments:**
   Click on the Scalapay Payments link in the Static Examples section

## How It Works

### Geographic Availability

Scalapay is available in France and other European countries

### Client-Side Flow

1. **SDK Initialization**: Loads PayPal Web SDK with Scalapay components using a client ID fetched from the server's `/paypal-api/auth/browser-safe-client-id` endpoint
2. **Eligibility Check**: Verifies Scalapay is eligible for the merchant with EUR currency and FR buyer country
3. **Session Creation**: Creates Scalapay payment session with event callbacks for handling payment lifecycle events
4. **Field Setup**: Mounts the required full name and email fields, plus custom phone number input
5. **Validation**: Validates all fields (name, email, phone) before initiating the payment flow
6. **Payment Flow**: Opens a popup window where customers authorize the payment with Scalapay. The order is created server-side via `/paypal-api/checkout/orders/create-order-for-scalapay` with custom processing instruction before displaying the popup
7. **Completion**: Processes the payment result by capturing the approved order via `/paypal-api/checkout/orders/:orderId/capture`, or handles cancellation and error scenarios appropriately

### Server-Side Requirements

The integration requires these endpoints (provided by the API server):

- `GET /paypal-api/auth/browser-safe-client-id` - Generate client ID
- `POST /paypal-api/checkout/orders/create-order-for-scalapay` - Create order with custom processing instruction (must use EUR currency)
- `POST /paypal-api/checkout/orders/:orderId/capture` - Capture order

### Special Order Configuration

Scalapay requires a special order creation payload with:
- `processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL"`
- Full breakdown of amounts including `itemTotal`
- Phone number passed during checkout session start

## Troubleshooting

### Scalapay not eligible

- Verify `testBuyerCountry` is set to "FR"
- Check that `currencyCode` is set to "EUR" (Euro)
- Ensure Scalapay is enabled for the merchant in PayPal account settings
- Verify your PayPal account is configured to accept EUR currency

### Validation fails

- Ensure all fields (name, email, phone) are properly filled
- Check that email format is correct
- Verify phone country code and national number are provided
- Ensure SDK fields (name, email) are mounted correctly

### Payment popup doesn't open

- Check for popup blockers
- Verify order creation returns valid orderId
- Ensure proper event handler setup
- Check browser console for errors
- Verify order is created with EUR currency
- Ensure phone data is passed correctly to the session options

### Order creation fails

- Verify API server is running on port 8080
- Check server logs for errors
- Validate order payload includes `processingInstruction`
- **Ensure currency_code is set to "EUR"** - this is critical for Scalapay
- Verify breakdown includes `itemTotal`

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
