# Zip One-Time Payment Integration

This example demonstrates how to integrate Zip payments using PayPal's v6 Web SDK. Zip is a popular buy now, pay later (BNPL) payment method available in Australia that allows customers to split payments into installments.

## Architecture Overview

This sample demonstrates a complete Zip integration flow:

1. Initialize PayPal Web SDK with the Zip component
2. Check eligibility for Zip payment method
3. Create Zip payment session with required payment fields
4. Validate customer name and email before initiating payment
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through Zip popup flow
7. Handle payment approval, cancellation, and errors

## Features

- Zip one-time payment integration
- Full name and email field validation via PayPal SDK payment fields
- Popup payment flow
- Eligibility checking for Zip
- Error handling and user feedback
- Multi-currency support (AUD)

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

3. **Enable Zip Payment**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Navigate to **Account Settings** by clicking the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
   - Find **Zip** in the payment methods and enable it
   - Ensure your account is configured to accept supported currencies (AUD)

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

Zip is available in Australia.

### Client-Side Flow

1. **SDK Initialization**: Loads PayPal Web SDK core and the `zip-payments` component using a client ID fetched from the server's `/paypal-api/auth/browser-safe-client-id` endpoint. `testBuyerCountry` is set to `"AU"` for sandbox testing.
2. **Eligibility Check**: Verifies Zip is eligible for the merchant with AUD currency.
3. **Session Creation**: Creates a Zip payment session (`createZipOneTimePaymentSession`) with event callbacks for handling payment lifecycle events.
4. **Field Setup**: Mounts the required full name and email fields provided by the SDK.
5. **Validation**: Validates the name and email fields before initiating the payment flow.
