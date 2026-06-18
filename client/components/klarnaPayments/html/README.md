# Klarna One-Time Payment Integration

This example demonstrates how to integrate Klarna payments using PayPal's v6 Web SDK. Klarna is a popular buy now, pay later (BNPL) payment method available across multiple countries that allows customers to split payments into installments.

## Architecture Overview

This sample demonstrates a complete Klarna integration flow:

1. Initialize PayPal Web SDK with the Klarna component
2. Check eligibility for Klarna payment method
3. Create Klarna payment session with required payment fields
4. Validate customer name and email before initiating payment
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through Klarna popup flow
7. Handle payment approval, cancellation, and errors

## Features

- Klarna one-time payment integration
- Full name and email field validation via PayPal SDK payment fields
- Popup payment flow
- Eligibility checking for Klarna
- Error handling and user feedback
- Multi-currency support (GBP, EUR, USD, SEK, DKK, NOK, etc.)

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

3. **Enable Klarna Payment**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Navigate to **Account Settings** by clicking the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
   - Find **Klarna** in the payment methods and enable it
   - Ensure your account is configured to accept supported currencies (GBP, EUR, USD, etc.)

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

Klarna is available in multiple countries including UK, Germany, Austria, Netherlands, Belgium, Spain, France, Italy, Finland, Sweden, Norway, Denmark, and the United States.

### Client-Side Flow

1. **SDK Initialization**: Loads PayPal Web SDK core and the `klarna-payments` component using a client ID fetched from the server's `/paypal-api/auth/browser-safe-client-id` endpoint. `testBuyerCountry` is set to `"GB"` for sandbox testing.
2. **Eligibility Check**: Verifies Klarna is eligible for the merchant with GBP currency.
3. **Session Creation**: Creates a Klarna payment session (`createKlarnaOneTimePaymentSession`) with event callbacks for handling payment lifecycle events.
4. **Field Setup**: Mounts the required full name and email fields provided by the SDK.
5. **Validation**: Validates the name and email fields before initiating the payment flow.
6. **Order & Payment Flow**: Opens a popup window where the customer selects their Klarna payment option. The order is created server-side via `/paypal-api/checkout/orders/create-order-for-one-time-payment` with the `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction.
7. **Completion**: Processes the payment result by fetching order details via `/paypal-api/checkout/orders/:orderId` (order is auto-completed due to processing instruction), or handles cancellation and error scenarios appropriately.

### Server-Side Requirements

The integration requires these endpoints (provided by the API server):

- `GET /paypal-api/auth/browser-safe-client-id` - Return client ID
- `POST /paypal-api/checkout/orders/create-order-for-one-time-payment` - Create order with appropriate currency and `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
- `GET /paypal-api/checkout/orders/:orderId` - Fetch order details after approval

### Special Order Configuration

Klarna requires an order creation payload with:

- `processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL"` — the order is auto-completed on approval, so no separate capture call is needed
- Supported currency (GBP, EUR, USD, SEK, DKK, NOK, etc.)

## Troubleshooting

### Klarna not eligible

- Verify `testBuyerCountry` is set to a supported country (e.g., `"GB"`)
- Check that `currencyCode` is set to a supported currency
- Ensure Klarna is enabled for the merchant in PayPal account settings
- Verify your PayPal account is configured to accept the specified currency

### Validation fails

- Ensure the full name and email fields are properly mounted with JavaScript
- Check that both fields have valid input
- Ensure the fields are visible in the DOM

### Payment popup doesn't open

- Check for popup blockers
- Verify order creation returns a valid orderId
- Ensure proper event handler setup
- Check browser console for errors

### Order creation fails

- Verify API server is running on port 8080
- Check server logs for errors
- Ensure currency_code is set to a supported currency for Klarna

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
