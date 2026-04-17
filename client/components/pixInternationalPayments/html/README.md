# Pix International One-Time Payment Integration

This example demonstrates how to integrate Pix International payments using PayPal's v6 Web SDK. Pix is Brazil's instant payment method operated by the Central Bank of Brazil, allowing customers to complete payments instantly using their banking app or QR code.

## Architecture Overview

1. Initialize PayPal Web SDK with the Pix International component
2. Check eligibility for Pix International payment method
3. Create Pix International payment session with required payment fields
4. Validate customer name, email, and tax information (CPF/CNPJ)
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through Pix International popup flow
7. Handle payment approval, cancellation, and errors

## Features

- Pix International one-time payment integration
- Full name and email field validation via PayPal SDK payment fields
- Tax ID input with type selection (CPF for individuals, CNPJ for businesses)
- Popup payment flow
- Eligibility checking for Pix International
- Error handling and user feedback
- BRL (Brazilian Real) currency support

## Prerequisites

### 1. PayPal Developer Account Setup

1. **PayPal Developer Account**
   - Visit [developer.paypal.com](https://developer.paypal.com)
   - Sign up for a developer account or log in with existing credentials
   - Navigate to the **Apps & Credentials** section in your dashboard

2. **Create a PayPal Application**
   - Click **Create App**, name your app, select **Merchant** under **Type**
   - Choose the **Sandbox** account for testing
   - Note your **Client ID** and **Secret key** for the `.env` file

3. **Enable Pix International**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Navigate to **Account Settings** → **Payment methods**
   - Find **Pix** and enable it
   - Ensure your account is configured to accept **BRL (Brazilian Real)**

### 2. System Requirements

- Node.js version 20 or higher
- Server running on port 8080 (see `server/node/` directory)

## Running the Demo

1. **Navigate to the server directory:** `cd server/node`
2. **Install dependencies:** `npm install`
3. **Configure environment variables:**
   ```env
   PAYPAL_SANDBOX_CLIENT_ID=your_paypal_sandbox_client_id
   PAYPAL_SANDBOX_CLIENT_SECRET=your_paypal_sandbox_client_secret
   ```
4. **Start the server:** `npm start` — runs on `http://localhost:8080`

## How It Works

### Geographic Availability

Pix International is available in Brazil (BR).

### Client-Side Flow

1. **SDK Initialization**: Loads PayPal Web SDK core and the `pix-international-payments` component. `testBuyerCountry` is set to `"BR"` for sandbox testing.
2. **Eligibility Check**: Verifies Pix International is eligible using `isEligible("pix_international")` with BRL currency.
3. **Session Creation**: Creates a session via `createPixInternationalOneTimePaymentSession` with event callbacks.
4. **Field Setup**: Mounts full name and email fields provided by the SDK, and reveals custom tax ID inputs.
5. **Validation**: Validates SDK fields and tax info before initiating payment.
6. **Order & Payment Flow**: Opens a popup where the customer completes the Pix payment. The order is created via `/paypal-api/checkout/orders/create-order-for-one-time-payment` with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`. Tax ID and type are passed alongside the order ID.
7. **Completion**: Fetches order details via `/paypal-api/checkout/orders/:orderId` after approval.

### Key Fields

| Tax ID Type | Description |
|-------------|-------------|
| `BR_CPF` | Individual taxpayer identification (11 digits) |
| `BR_CNPJ` | Corporate taxpayer identification (14 digits) |

### Server-Side Requirements

- `GET /paypal-api/auth/browser-safe-client-id` - Return client ID
- `POST /paypal-api/checkout/orders/create-order-for-one-time-payment` - Create order with BRL currency and `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`
- `GET /paypal-api/checkout/orders/:orderId` - Fetch order details after approval

## Troubleshooting

### Pix International not eligible
- Verify `testBuyerCountry` is set to `"BR"`
- Check that `currencyCode` is set to `"BRL"`
- Ensure Pix is enabled in PayPal account settings

### Validation fails
- Ensure Tax ID and Tax ID Type are both filled in
- Verify Tax ID format matches the selected type (CPF: 11 digits, CNPJ: 14 digits)

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
