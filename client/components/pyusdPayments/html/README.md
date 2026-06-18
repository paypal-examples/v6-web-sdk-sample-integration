# PYUSD One-Time Payment Integration

This example demonstrates how to integrate PYUSD payments using PayPal's v6 Web SDK. PYUSD (PayPal USD) is a USD-backed stablecoin that lets eligible customers pay from their PayPal PYUSD balance.

> **Note:** PYUSD is not present in the upstream sample-integration repository. This component was authored locally following the same structure and SDK conventions as the other Alternative Payment Method (APM) examples (e.g. FPX, Trustly). Confirm the exact SDK identifiers (`createPyusdOneTimePaymentSession`, `isEligible("pyusd")`, `components: ["pyusd-payments"]`) against your target Web SDK version before relying on this in production.

## Architecture Overview

1. Initialize PayPal Web SDK with the PYUSD component
2. Check eligibility for the PYUSD payment method
3. Create a PYUSD payment session with required payment fields
4. Validate customer name before initiating payment
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through the PYUSD popup flow
7. Handle payment approval, cancellation, and errors

## Features

- PYUSD one-time payment integration
- Full name field validation via PayPal SDK payment fields
- Popup payment flow
- Eligibility checking for PYUSD
- Error handling and user feedback
- USD (US Dollar) currency support

## Prerequisites

### 1. PayPal Developer Account Setup

1. **PayPal Developer Account** — Visit [developer.paypal.com](https://developer.paypal.com)
2. **Create a PayPal Application** — Note your **Client ID** and **Secret key**
3. **Enable PYUSD** — In [sandbox.paypal.com](https://www.sandbox.paypal.com), go to **Account Settings** → **Payment methods**, enable PYUSD, and configure **USD** currency

### 2. System Requirements

- Node.js version 20 or higher
- Server running on port 8080

## Running the Demo

1. `cd server/node` → `npm install`
2. Create `.env`:
   ```env
   PAYPAL_SANDBOX_CLIENT_ID=your_paypal_sandbox_client_id
   PAYPAL_SANDBOX_CLIENT_SECRET=your_paypal_sandbox_client_secret
   ```
3. `npm start` — runs on `http://localhost:8080`

## How It Works

### Geographic Availability

PYUSD is available to eligible buyers in the United States (US).

### Client-Side Flow

1. **SDK Initialization**: `testBuyerCountry` is `"US"`, component `pyusd-payments`.
2. **Eligibility Check**: `isEligible("pyusd")` with USD currency.
3. **Session Creation**: `createPyusdOneTimePaymentSession`.
4. **Field Setup**: Mounts the full name field provided by the SDK.
5. **Order & Payment Flow**: Creates order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` and USD currency. Returns `{ orderId }`.
6. **Completion**: Fetches order details via `/paypal-api/checkout/orders/:orderId`.

### Server-Side Requirements

- `GET /paypal-api/auth/browser-safe-client-id`
- `POST /paypal-api/checkout/orders/create-order-for-one-time-payment` (USD + `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`)
- `GET /paypal-api/checkout/orders/:orderId`

## Troubleshooting

- Verify `testBuyerCountry` is `"US"` and `currencyCode` is `"USD"`
- Ensure PYUSD is enabled in your PayPal sandbox account settings
- Ensure the full name field is filled in
- If the button never appears, the eligibility check returned `false` — confirm PYUSD is enabled and the SDK exposes the `pyusd` method

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
