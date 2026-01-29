# Klarna One-Time Payment Integration

This example demonstrates how to integrate Klarna payments using PayPal's v6 Web SDK. Klarna is a popular "buy now, pay later" payment method that allows customers to pay over time with flexible payment options.

## Architecture Overview

This sample demonstrates a complete Klarna integration flow:

1. Initialize PayPal Web SDK with the Klarna component
2. Check eligibility for Klarna payment method
3. Create Klarna payment session with required payment fields
4. Validate customer information before initiating payment
5. Collect billing address and phone information
6. Process payment through Klarna popup flow
7. Handle payment approval, cancellation, and errors
8. Authorize the order after approval

## Features

- Klarna one-time payment integration
- Full name and email field validation
- Billing address collection
- Phone number collection
- Popup payment flow
- Eligibility checking for Klarna
- Order authorization (not capture)
- Error handling and user feedback

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

### Client Setup

1. **Navigate to the Klarna demo directory:**

   ```bash
   cd client/components/klarnaPayments/html
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

1. **SDK Initialization**: Loads PayPal Web SDK with Klarna components using a client token fetched from the server's `/paypal-api/auth/browser-safe-client-token` endpoint
2. **Session Creation**: Creates Klarna payment session with event callbacks for handling payment lifecycle events
3. **Field Setup**: Mounts the required full name and email fields
4. **Billing Data Collection**: Collects billing address and phone information from HTML form
5. **Validation**: Validates fields and billing data before initiating the payment flow
6. **Payment Flow**: Opens a popup window where customers authorize the payment. The order is created server-side via `/paypal-api/checkout/orders/create` before displaying the popup
7. **Completion**: Processes the payment result by authorizing the approved order via `/paypal-api/checkout/orders/:orderId/authorize`, or handles cancellation and error scenarios appropriately

### Server-Side Requirements

The integration requires these endpoints (provided by the API server):

- `GET /paypal-api/auth/browser-safe-client-token` - Generate client token
- `POST /paypal-api/checkout/orders/create` - Create order with AUTHORIZE intent
- `POST /paypal-api/checkout/orders/:orderId/authorize` - Authorize order

## Key Integration Points

### Payment Intent

Unlike most other payment methods, Klarna uses **AUTHORIZE** intent instead of CAPTURE:

- Orders are created with `intent: "AUTHORIZE"`
- After approval, orders are authorized (not captured)
- Authorizations must be captured separately within 29 days
- Include `processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL"` in order payload

### Required Fields

Klarna requires two payment fields:

1. **Full Name** - Customer's full name
2. **Email** - Customer's email address

### Billing Address Requirements

Klarna requires complete billing address information:

```javascript
{
  addressLine1: "123 Main St",        // Required
  adminArea1: "London",                // State/Province - Required
  adminArea2: "Greater London",        // City/Region - Required
  postalCode: "SW1A 1AA",             // Postal/ZIP code - Required
  countryCode: "GB"                    // ISO country code - Required
}
```

### Phone Requirements

Klarna requires phone information:

```javascript
{
  countryCode: "44",                   // Country code - Required
  nationalNumber: "7123456789"         // Phone number - Required
}
```

### Order Payload

The order payload must include:

- `intent`: Set to `"AUTHORIZE"` (not CAPTURE)
- `processingInstruction`: Set to `"ORDER_COMPLETE_ON_PAYMENT_APPROVAL"`
- `currency_code`: Must match the buyer country (e.g., "GBP" for "GB")

Example:

```javascript
const orderPayload = {
  intent: "AUTHORIZE",
  purchaseUnits: [
    {
      amount: {
        currencyCode: "GBP",
        value: "100.00",
      },
    },
  ],
  processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
};
```

## Available Scripts

- `npm start` - Start Vite development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Troubleshooting

### Klarna not eligible

- Verify `testBuyerCountry` is set to a supported country (e.g., "GB", "NL")
- Check that Klarna is enabled for the merchant in PayPal account settings
- Ensure currency code matches the country (e.g., "GBP" for "GB")

### Validation fails

- Ensure full name and email fields are properly mounted with javascript
- Check that fields have valid input
- Verify field is visible in the DOM
- Verify billing address form is complete

### Payment popup doesn't open

- Check for popup blockers
- Verify order creation returns valid orderId
- Ensure proper event handler setup
- Check browser console for errors
- Confirm billing data is correctly formatted

### Order creation fails

- Verify API server is running on port 8080
- Check server logs for errors
- Validate order payload format
- Ensure intent is set to "AUTHORIZE" (not "CAPTURE")
- Verify processingInstruction is included

### Authorization fails

- Check that order was created successfully
- Verify billing address and phone data are complete
- Ensure customer completed the Klarna flow
- Check that all required billing fields are provided

## Supported Countries and Currencies

Klarna is available in the following countries:

- **AT (Austria)**: EUR
- **AU (Australia)**: AUD
- **BE (Belgium)**: EUR
- **CA (Canada)**: CAD
- **CH (Switzerland)**: CHF
- **CZ (Czech Republic)**: CZK
- **DE (Germany)**: EUR
- **DK (Denmark)**: DKK
- **ES (Spain)**: EUR
- **FI (Finland)**: EUR
- **FR (France)**: EUR
- **GB (United Kingdom)**: GBP
- **GR (Greece)**: EUR
- **HU (Hungary)**: HUF
- **IE (Ireland)**: EUR
- **IT (Italy)**: EUR
- **MX (Mexico)**: MXN
- **NL (Netherlands)**: EUR
- **NO (Norway)**: NOK
- **NZ (New Zealand)**: NZD
- **PL (Poland)**: PLN
- **PT (Portugal)**: EUR
- **RO (Romania)**: RON
- **SE (Sweden)**: SEK
- **SK (Slovakia)**: EUR
- **US (United States)**: USD

Ensure your `testBuyerCountry` and `currencyCode` match appropriately.

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
