# BLIK One-Time Payment Integration

This example demonstrates how to integrate BLIK payments using PayPal's v6 Web SDK. BLIK is a popular mobile payment method in Poland that allows customers to make instant payments using a 6-digit code generated in their mobile banking app.

## 🏗️ Architecture Overview

This sample demonstrates a complete BLIK integration flow:

1. Initialize PayPal Web SDK with the BLIK component
2. Check eligibility for BLIK payment method
3. Create BLIK payment session with required payment fields
4. Validate customer information before initiating payment
5. Process payment through BLIK popup flow with 6-digit code entry
6. Handle payment approval, cancellation, and errors

## Features

- BLIK one-time payment integration
- Full name and email field validation
- Popup payment flow with BLIK code entry
- Eligibility checking for BLIK
- Error handling and user feedback
- PLN (Polish Złoty) currency support

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

3. **Enable BLIK Payment**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Navigate to **Account Settings** by clicking the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
   - Find **BLIK** in the payment methods and enable it
   - Ensure your account is configured to accept **PLN (Polish Złoty)** currency

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

1. **Navigate to the BLIK demo directory:**

   ```bash
   cd client/components/blikPayments/html
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

1. **SDK Initialization**: Loads PayPal Web SDK with BLIK components using a client token fetched from the server's `/paypal-api/auth/browser-safe-client-token` endpoint
2. **Eligibility Check**: Verifies BLIK is eligible for the merchant with PLN currency
3. **Session Creation**: Creates BLIK payment session with event callbacks for handling payment lifecycle events
4. **Field Setup**: Mounts the required full name and email fields
5. **Validation**: Validates both fields before initiating the payment flow
6. **Payment Flow**: Opens a popup window where customers enter their 6-digit BLIK code generated from their mobile banking app. The order is created server-side via `/paypal-api/checkout/orders/create` before displaying the popup
7. **Completion**: Processes the payment result by capturing the approved order via `/paypal-api/checkout/orders/:orderId/capture`, or handles cancellation and error scenarios appropriately

### BLIK Payment Process

1. Customer enters full name and email on merchant website
2. Customer validates both fields and clicks BLIK button
3. Popup opens showing BLIK payment interface
4. Customer opens their mobile banking app
5. Customer generates a 6-digit BLIK code in the app
6. Customer enters the code in the payment interface
7. Customer confirms the payment in their banking app
8. Transaction is completed and customer returns to merchant site

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

### BLIK not eligible

- Verify `testBuyerCountry` is set to "PL"
- Check that `currencyCode` is set to "PLN" (Polish Złoty)
- Ensure BLIK is enabled for the merchant in PayPal account settings
- Verify your PayPal account is configured to accept PLN currency

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
- Verify order is created with PLN currency

### Order creation fails

- Verify API server is running on port 8080
- Check server logs for errors
- Validate order payload format
- **Ensure currency_code is set to "PLN"** - this is critical for BLIK

### BLIK code entry issues

- Ensure customer has access to their mobile banking app
- Verify customer's bank supports BLIK
- Check that the generated code is entered within the time limit (typically 2 minutes)
- Ensure customer confirms the payment in their banking app

## Important Notes

- **Currency**: BLIK payments **must** use PLN (Polish Złoty) currency
- **Required Fields**: BLIK requires both name and email fields (unlike some other payment methods that only require name)
- **Geographic Availability**: BLIK is available in Poland
- **Code Expiration**: BLIK codes generated in mobile banking apps typically expire after 2 minutes

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
