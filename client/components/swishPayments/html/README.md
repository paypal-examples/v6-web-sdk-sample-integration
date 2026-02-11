# Swish One-Time Payment Integration

This example demonstrates how to integrate Swish payments using PayPal's v6 Web SDK. Swish is a popular payment method in Sweden that allows customers to pay directly from their bank accounts.

## 🏗️ Architecture Overview

This sample demonstrates a complete Swish integration flow:

1. Initialize PayPal Web SDK with the Swish component
2. Check eligibility for Swish payment method
3. Create Swish payment session with required payment fields
4. Validate customer information before initiating payment
5. Process payment through Swish popup flow
6. Handle payment approval, cancellation, and errors

## Features

- Swish one-time payment integration
- Full name field validation
- Popup payment flow
- Eligibility checking for Swish
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

3. **Enable Swish Payment**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Navigate to **Account Settings** by clicking the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
   - Find **Swish** in the payment methods and enable it

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

1. **Navigate to the Swish demo directory:**

   ```bash
   cd client/components/swishPayments/html
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

1. **SDK Initialization**: Loads PayPal Web SDK with Swish components using a client token fetched from the server's `/paypal-api/auth/browser-safe-client-token` endpoint
2. **Eligibility Check**: Verifies Swish is eligible for the merchant
3. **Session Creation**: Creates Swish payment session with event callbacks for handling payment lifecycle events
4. **Field Setup**: Mounts the required full name field
5. **Validation**: Validates fields before initiating the payment flow
6. **Payment Flow**: Opens a popup window where customers provide billing details and authorize the payment. The order is created server-side via `/paypal-api/checkout/orders/create` before displaying the popup
7. **Completion**: Processes the payment result by capturing the approved order via `/paypal-api/checkout/orders/:orderId/capture`, or handles cancellation and error scenarios appropriately

### Server-Side Requirements

The integration requires these endpoints (provided by the API server):

- `GET /paypal-api/auth/browser-safe-client-token` - Generate client token
- `POST /paypal-api/checkout/orders/create` - Create order
- `POST /paypal-api/checkout/orders/:orderId/capture` - Capture order

## Available Scripts

- `npm start` - Start Vite development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Troubleshooting

### Swish not eligible

- Verify `testBuyerCountry` is set to "SE"
- Check that Swish is enabled for the merchant in PayPal account settings

### Validation fails

- Ensure full name field is properly mounted
- Check that field has valid input
- Verify field is visible in the DOM

### Payment popup doesn't open

- Check for popup blockers
- Verify order creation returns valid orderId
- Ensure proper event handler setup
- Check browser console for errors

### Order creation fails

- Verify API server is running on port 8080
- Check server logs for errors
- Validate order payload format

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
