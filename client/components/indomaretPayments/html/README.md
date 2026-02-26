# Indomaret One-Time Payment Integration

This example demonstrates how to integrate Indomaret payments using PayPal's v6 Web SDK. Indomaret is Indonesia's largest convenience store chain, offering cash payment services that enable customers to complete online purchases by paying at any Indomaret store location nationwide.

## 🏗️ Architecture Overview

This sample demonstrates a complete Indomaret integration flow:

1. Initialize PayPal Web SDK with the Indomaret component
2. Check eligibility for Indomaret payment method
3. Create Indomaret payment session with required payment fields
4. Validate customer information before initiating payment
5. Authorize the payment through Indomaret popup flow
6. Handle payment approval, cancellation, and errors

## Features

- Indomaret one-time payment integration
- Full name and email field validation
- Popup payment flow with payment code generation
- Eligibility checking for Indomaret
- Error handling and user feedback
- IDR (Indonesian Rupiah) currency support

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

3. **Enable Indomaret Payment**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Navigate to **Account Settings** by clicking the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
   - Find **Indomaret** in the payment methods and enable it
   - Ensure your account is configured to accept **IDR (Indonesian Rupiah)** currency

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

1. **Navigate to the Indomaret demo directory:**

   ```bash
   cd client/components/indomaretPayments/html
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

Indomaret is available in Indonesia

### Client-Side Flow

1. **SDK Initialization**: Loads PayPal Web SDK with Indomaret components using a client token fetched from the server's `/paypal-api/auth/browser-safe-client-token` endpoint
2. **Eligibility Check**: Verifies Indomaret is eligible for the merchant with IDR currency
3. **Session Creation**: Creates Indomaret payment session with event callbacks for handling payment lifecycle events
4. **Field Setup**: Mounts the required full name and email fields
5. **Validation**: Validates both fields before initiating the payment flow
6. **Payment Flow**: Opens a popup window where customers receive a payment code to complete their purchase at any Indomaret store. The order is created server-side via `/paypal-api/checkout/orders/create` before displaying the popup
7. **Completion**: Processes the payment result by capturing the approved order via `/paypal-api/checkout/orders/:orderId/capture`, or handles cancellation and error scenarios appropriately

### Server-Side Requirements

The integration requires these endpoints (provided by the API server):

- `GET /paypal-api/auth/browser-safe-client-token` - Generate client token
- `POST /paypal-api/checkout/orders/create` - Create order (must use IDR currency)
- `POST /paypal-api/checkout/orders/:orderId/capture` - Capture order

## Available Scripts

- `npm start` - Start Vite development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Troubleshooting

### Indomaret not eligible

- Verify `testBuyerCountry` is set to "ID"
- Check that `currencyCode` is set to "IDR" (Indonesian Rupiah)
- Ensure Indomaret is enabled for the merchant in PayPal account settings
- Verify your PayPal account is configured to accept IDR currency

### Validation fails

- Ensure both full name and email fields are properly mounted with javascript
- Check that both fields have valid input
- Verify email format is correct
- Ensure fields are visible in the DOM

### Payment popup doesn't open

- Check for popup blockers
- Verify order creation returns valid orderId
- Ensure proper event handler setup
- Check browser console for errors
- Verify order is created with IDR currency

### Order creation fails

- Verify API server is running on port 8080
- Check server logs for errors
- Validate order payload format
- **Ensure currency_code is set to "IDR"** - this is critical for Indomaret

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
