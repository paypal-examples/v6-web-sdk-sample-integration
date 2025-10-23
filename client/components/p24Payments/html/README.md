# P24 (Przelewy24) One-Time Payment Integration

This example demonstrates how to integrate P24 (Przelewy24) payments using PayPal's v6 Web SDK. Przelewy24 is one of the most popular payment methods in Poland that allows customers to pay directly from their bank accounts using online banking.

## 🏗️ Architecture Overview

This sample demonstrates a complete P24 integration flow:

1. Initialize PayPal Web SDK with the P24 component
2. Check eligibility for P24 payment method
3. Create P24 payment session with required payment fields
4. Validate customer information before initiating payment
5. Process payment through P24 popup flow with bank selection
6. Handle payment approval, cancellation, and errors

## Features

- P24 (Przelewy24) one-time payment integration
- Full name and email field validation
- Popup payment flow with online banking redirect
- Eligibility checking for P24
- Error handling and user feedback

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

3. **Enable P24 Payment**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Navigate to **Account Settings** by clicking the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
   - Find **Przelewy24 (P24)** in the payment methods and enable it

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

1. **Navigate to the P24 demo directory:**

   ```bash
   cd client/components/p24Payments/html
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

### Client-Side Flow

1. **SDK Initialization**: Loads PayPal Web SDK with P24 components using a client token fetched from the server's `/paypal-api/auth/browser-safe-client-token` endpoint
2. **Session Creation**: Creates P24 payment session with event callbacks for handling payment lifecycle events
3. **Field Setup**: Mounts the required full name and email fields
4. **Validation**: Validates both fields before initiating the payment flow
5. **Payment Flow**: Opens a popup window where customers select their bank and complete payment through online banking. The order is created server-side via `/paypal-api/checkout/orders/create` before displaying the popup
6. **Completion**: Processes the payment result by capturing the approved order via `/paypal-api/checkout/orders/:orderId/capture`, or handles cancellation and error scenarios appropriately

### Server-Side Requirements

The integration requires these endpoints (provided by the API server):

- `GET /paypal-api/auth/browser-safe-client-token` - Generate client token
- `POST /paypal-api/checkout/orders/create` - Create order (must use PLN currency)
- `POST /paypal-api/checkout/orders/:orderId/capture` - Capture order

## Available Scripts

- `npm start` - Start Vite development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Troubleshooting

### P24 not eligible

- Verify `testBuyerCountry` is set to "PL" (Poland)
- Ensure P24 (Przelewy24) is enabled for the merchant in PayPal account settings

### Validation fails

- Ensure both full name and email fields are properly mounted
- Check that both fields have valid input
- Verify email format is correct
- Ensure fields are visible in the DOM

### Payment popup doesn't open

- Check for popup blockers
- Verify order creation returns valid orderId
- Ensure proper event handler setup
- Check browser console for errors

### Order creation fails

- Verify API server is running on port 8080
- Check server logs for errors
- Validate order payload format

### Merchant not eligible

- Verify your merchant account has P24 enabled
- Check if merchant country is supported
- Contact PayPal support for merchant account eligibility

## Important Notes

- **Required Fields**: P24 requires both name and email fields for the payer
- **Geographic Availability**: P24 is primarily available in Poland
- **Presentation Mode**: This implementation uses popup mode for the payment flow

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
