# Afterpay One-Time Payment Integration

This example demonstrates how to integrate Afterpay payments using PayPal's v6 Web SDK. Afterpay is a popular buy now, pay later (BNPL) payment method available across multiple countries that allows customers to split payments into installments.

## Architecture Overview

This sample demonstrates a complete Afterpay integration flow:

1. Initialize PayPal Web SDK with the Afterpay component
2. Check eligibility for Afterpay payment method
3. Create Afterpay payment session with required payment fields
4. Validate customer name and email before initiating payment
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through Afterpay popup flow
7. Handle payment approval, cancellation, and errors

## Features

- Afterpay one-time payment integration
- Full name and email field validation via PayPal SDK payment fields
- Popup payment flow
- Eligibility checking for Afterpay
- Error handling and user feedback
- Multi-currency support (AUD, NZD, USD, GBP, CAD)

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

3. **Enable Afterpay Payment**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Navigate to **Account Settings** by clicking the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
   - Find **Afterpay** in the payment methods and enable it
   - Ensure your account is configured to accept supported currencies (AUD, NZD, USD, etc.)

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

Afterpay is available in multiple countries including Australia, New Zealand, United States, United Kingdom, and Canada.

### Client-Side Flow

1. **SDK Initialization**: Loads PayPal Web SDK core and the `afterpay-payments` component using a client ID fetched from the server's `/paypal-api/auth/browser-safe-client-id` endpoint. `testBuyerCountry` is set to `"AU"` for sandbox testing.
2. **Eligibility Check**: Verifies Afterpay is eligible for the merchant with AUD currency.
3. **Session Creation**: Creates an Afterpay payment session (`createAfterpayOneTimePaymentSession`) with event callbacks for handling payment lifecycle events.
4. **Field Setup**: Mounts the required full name and email fields provided by the SDK.
5. **Validation**: Validates the name and email fields before initiating the payment flow.
