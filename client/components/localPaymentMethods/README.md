# Local Payment Methods (APM) Sample Integrations

This folder contains sample integrations for PayPal's local / alternative payment
methods (APMs) built with the v6 Web SDK. Every sample follows the same structure
and integration flow — this guide documents everything common to all of them, so
each individual method's README only needs to list what is unique to that method
(currency, buyer country, SDK component, and session method).

> **Per-method details:** each payment method's own README (e.g.
> [`oxxopayPayments/html/README.md`](./oxxopayPayments/html/README.md)) lists its
> currency, buyer country, SDK component, eligibility key, and session method.

## Architecture Overview

Each sample demonstrates a complete one-time payment flow:

1. Initialize the PayPal Web SDK with the payment method's component
2. Check eligibility for the payment method
3. Create a payment session with the required payment fields
4. Validate the customer name before initiating payment
5. Create a PayPal order with the `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through the method's popup flow
7. Handle payment approval, cancellation, and errors

## Features

- One-time payment integration for the local payment method
- Full name field validation via PayPal SDK payment fields
- Popup payment flow
- Eligibility checking for the payment method
- Error handling and user feedback
- Method-specific currency support (see the method's README)

## Prerequisites

Before running any demo, you'll need to set up accounts and configure your
development environment.

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

3. **Enable the Payment Method**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Navigate to **Account Settings** by clicking the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
   - Find the payment method (see the method's README) and enable it
   - Ensure your account is configured to accept the method's required currency

### 2. System Requirements

- Node.js version 20 or higher
- Server running on port 8080 (see the `server/node/` directory)

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

   The server will run on `http://localhost:8080`.

5. Open [http://localhost:8080](http://localhost:8080) and choose the payment
   method you want to try from the **Local Payment Methods** list.

## How It Works

### Client-Side Flow

The buyer country and currency referenced below are method-specific — see the
individual method's README for the exact values.

1. **SDK Initialization**: Loads the PayPal Web SDK with the method's component using a client ID fetched from the server's `/paypal-api/auth/browser-safe-client-id` endpoint. `testBuyerCountry` is set to the method's sandbox test country.
2. **Eligibility Check**: Verifies the method is eligible for the merchant with the method's currency via `findEligibleMethods()` / `isEligible()`.
3. **Session Creation**: Creates the method's payment session (e.g. `createOxxopayOneTimePaymentSession`) with event callbacks for handling payment lifecycle events.
4. **Field Setup**: Mounts the required full name field provided by the SDK.
5. **Validation**: Validates the name field before initiating the payment flow.
6. **Order & Payment Flow**: Opens a popup window where the customer authorizes the payment. The order is created server-side via `/paypal-api/checkout/orders/create-order-for-one-time-payment` with the `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction.
7. **Completion**: Processes the payment result by fetching order details via `/paypal-api/checkout/orders/:orderId` (the order is auto-completed due to the processing instruction), or handles cancellation and error scenarios appropriately.

### Server-Side Requirements

The integration relies on these endpoints (provided by the API server):

- `GET /paypal-api/auth/browser-safe-client-id` — return the client ID
- `POST /paypal-api/checkout/orders/create-order-for-one-time-payment` — create an order with the method's currency and the `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
- `GET /paypal-api/checkout/orders/:orderId` — fetch order details after approval

### Special Order Configuration

Local payment methods create the order with:

- `processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL"` — the order is auto-completed on approval, so no separate capture call is needed
- the method's required currency code (see the method's README)

## Troubleshooting

### Payment method not eligible

- Verify `testBuyerCountry` matches the value in the method's README
- Check that `currencyCode` matches the method's required currency
- Ensure the payment method is enabled for the merchant in PayPal account settings
- Verify your PayPal account is configured to accept the method's currency

### Validation fails

- Ensure the full name field is properly mounted with JavaScript
- Check that the name field has valid input
- Ensure the field is visible in the DOM

### Payment popup doesn't open

- Check for popup blockers
- Verify order creation returns a valid orderId
- Ensure proper event handler setup
- Check the browser console for errors

### Order creation fails

- Verify the API server is running on port 8080
- Check server logs for errors
- Ensure `currencyCode` is set to the method's required currency

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
