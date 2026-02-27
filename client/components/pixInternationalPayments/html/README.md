# PIX International One-Time Payment Integration

This example demonstrates how to integrate PIX International payments using PayPal's v6 Web SDK. PIX is Brazil's instant payment system, allowing customers to make real-time payments using their Brazilian bank accounts.

## 🏗️ Architecture Overview

This sample demonstrates a complete PIX International integration flow:

1. Initialize PayPal Web SDK with the PIX International component
2. Check eligibility for PIX International payment method
3. Create PIX International payment session with required payment fields
4. Validate customer information (name, email, tax ID) before initiating payment
5. Authorize the payment through PIX International popup flow
6. Handle payment approval, cancellation, and errors

## Features

- PIX International one-time payment integration
- Full name, email, and tax ID field validation
- Popup payment flow with PIX International authorization
- Eligibility checking for PIX International
- Error handling and user feedback
- BRL (Brazilian Real) currency support
- Custom order creation with processing instruction
- Support for CPF (individual) and CNPJ (business) tax IDs
- Comprehensive amount breakdown with shipping, handling, insurance, and discounts

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

3. **Enable PIX International Payment**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Navigate to **Account Settings** by clicking the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
   - Find **PIX International** in the payment methods and enable it
   - Ensure your account is configured to accept **BRL (Brazilian Real)** currency

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

1. **Navigate to the main page:**
   Open your browser and go to `http://localhost:8080`

2. **Select PIX International Payments:**
   Click on the PIX International Payments link in the Static Examples section

## How It Works

### Geographic Availability

PIX International is available for payments in Brazil (BR) using Brazilian Real (BRL) currency.

### Client-Side Flow

1. **SDK Initialization**: Loads PayPal Web SDK with PIX International components using a client ID fetched from the server's `/paypal-api/auth/browser-safe-client-id` endpoint
2. **Eligibility Check**: Verifies PIX International is eligible for the merchant with BRL currency and BR buyer country
3. **Session Creation**: Creates PIX International payment session with event callbacks for handling payment lifecycle events
4. **Field Setup**: Mounts the required full name and email fields, plus custom tax ID input fields (CPF/CNPJ)
5. **Validation**: Validates all fields (name, email, tax ID, tax ID type) before initiating the payment flow
6. **Payment Flow**: Opens a popup window where customers authorize the payment with PIX International. The order is created server-side via `/paypal-api/checkout/orders/create-order-for-one-time-payment` with custom processing instruction before displaying the popup
7. **Completion**: Processes the payment result by fetching the order details via `/paypal-api/checkout/orders/:orderId` (order is auto-completed due to processing instruction), or handles cancellation and error scenarios appropriately

### Server-Side Requirements

The integration requires these endpoints (provided by the API server):

- `GET /paypal-api/auth/browser-safe-client-id` - Generate client ID
- `POST /paypal-api/checkout/orders/create-order-for-one-time-payment` - Create order with custom processing instruction (must use BRL currency)
- `GET /paypal-api/checkout/orders/:orderId` - Fetch order details after approval

### Special Order Configuration

PIX International requires a special order creation payload with:
- `processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL"` - This auto-completes the payment on approval, so no capture is needed
- Full breakdown of amounts including:
  - `item_total` - Sum of all item unit amounts
  - `tax_total` - Sum of all item taxes (must equal `sum of (tax × quantity)` for all items)
  - `shipping` - Shipping cost (optional)
  - `handling` - Handling fee (optional)
  - `insurance` - Insurance cost (optional)
  - `shipping_discount` - Shipping discount (optional)
- Tax ID information passed during checkout session start
- Currency must be BRL (Brazilian Real)

### Important Amount Calculation Rules

The total amount must equal:
```
total = item_total + tax_total + shipping + handling + insurance - shipping_discount
```

**Tax Calculation:**
- Each item can have a `tax` field (per unit)
- The `tax_total` in breakdown must equal `sum of (item.tax × item.quantity)` for all items
- Example:
  - Item 1: tax = 10.00, quantity = 1 → contributes 10.00 to tax_total
  - Item 2: tax = 5.00, quantity = 2 → contributes 10.00 to tax_total
  - tax_total = 20.00

## Troubleshooting

### PIX International not eligible

- Verify `testBuyerCountry` is set to "BR"
- Check that `currencyCode` is set to "BRL" (Brazilian Real)
- Ensure PIX International is enabled for the merchant in PayPal account settings
- Verify your PayPal account is configured to accept BRL currency

### Validation fails

- Ensure all fields (name, email, tax ID, tax ID type) are properly filled
- Check that email format is correct
- Verify tax ID is provided (CPF or CNPJ format)
- Select the correct tax ID type from the dropdown (BR_CPF or BR_CNPJ)
- Ensure SDK fields (name, email) are mounted correctly

### Payment popup doesn't open

- Check for popup blockers
- Verify order creation returns valid orderId
- Ensure proper event handler setup
- Check browser console for errors
- Verify order is created with BRL currency
- Ensure tax ID data is passed correctly to the session options

### Order creation fails with AMOUNT_MISMATCH error

- Verify that `total = item_total + tax_total + shipping + handling + insurance - shipping_discount`
- Check that all amounts use string values with proper decimal formatting (e.g., "230.05")
- Ensure all currency codes match (BRL)

### Order creation fails with TAX_TOTAL_MISMATCH error

- Verify `tax_total` equals the sum of `(item.tax × item.quantity)` for all items
- Example calculation:
  ```
  Item 0: tax 10.00 × quantity 1 = 10.00
  Item 1: tax 5.00 × quantity 2 = 10.00
  tax_total must be 20.00
  ```
- Ensure each item's tax field is properly formatted as a string

### Order creation fails with schema validation error

- Verify all required fields are present in the order payload
- Check that the server-side schema (`ClientOrderPayloadSchema`) supports all fields:
  - `reference_id`, `description`, `custom_id`, `soft_descriptor`
  - `payee` object with `merchant_id`
  - `shipping` object with `method`
  - Item fields: `description`, `url`, `category`, `sku` (all optional)

### "onPayPalWebSdkLoaded is not defined" error

- Ensure `app.js` is loaded **before** the PayPal SDK script
- The correct script order in `index.html` should be:
  ```html
  <script src="app.js"></script>
  <script async src="...paypal.com/web-sdk/v6/core" onload="onPayPalWebSdkLoaded()"></script>
  ```

### API server issues

- Verify API server is running on port 8080
- Check server logs for errors
- Validate order payload includes `processing_instruction`
- **Ensure currency_code is set to "BRL"** - this is critical for PIX International
- Verify breakdown includes all required fields

## Tax ID Requirements

PIX International requires Brazilian tax identification:

- **CPF (Cadastro de Pessoas Físicas)**: Individual tax ID
  - Format: 11 digits
  - Type value: `BR_CPF`

- **CNPJ (Cadastro Nacional da Pessoa Jurídica)**: Business tax ID
  - Format: 14 digits
  - Type value: `BR_CNPJ`

These are collected through custom input fields and passed to the payment session during checkout.

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
- [PIX Payment System Overview](https://www.bcb.gov.br/en/financialstability/pix_en)
