# PayU One-Time Payment Integration

This example demonstrates how to integrate PayU payments using PayPal's v6 Web SDK. PayU is a popular buy now, pay later (BNPL) payment method available across multiple countries that allows customers to split payments into installments.

## Architecture Overview

This sample demonstrates a complete PayU integration flow:

1. Initialize PayPal Web SDK with the PayU component
2. Check eligibility for PayU payment method
3. Create PayU payment session with required payment fields
4. Validate customer name and email before initiating payment
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through PayU popup flow
7. Handle payment approval, cancellation, and errors

## Features

- PayU one-time payment integration
- Full name and email field validation via PayPal SDK payment fields
- Popup payment flow
- Eligibility checking for PayU
- Error handling and user feedback
- Multi-currency support (PLN, EUR, USD, SEK, DKK, NOK, etc.)

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

3. **Enable PayU Payment**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Navigate to **Account Settings** by clicking the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
   - Find **PayU** in the payment methods and enable it
   - Ensure your account is configured to accept supported currencies (PLN, EUR, USD, etc.)

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

PayU is available in multiple countries including Poland, Germany, Austria, Netherlands, Belgium, Spain, France, Italy, Finland, Sweden, Norway, Denmark, and the United States.

### Client-Side Flow

1. **SDK Initialization**: Loads PayPal Web SDK core and the `payu-payments` component using a client ID fetched from the server's `/paypal-api/auth/browser-safe-client-id` endpoint. `testBuyerCountry` is set to `"PL"` for sandbox testing.
2. **Eligibility Check**: Verifies PayU is eligible for the merchant with PLN currency.
3. **Session Creation**: Creates a PayU payment session (`createPayuOneTimePaymentSession`) with event callbacks for handling payment lifecycle events.
4. **Field Setup**: Mounts the required full name and email fields provided by the SDK.
5. **Validation**: Validates the name and email fields before initiating the payment flow.
