# Paysera One-Time Payment Integration

This demo shows how to integrate Paysera payments using the PayPal v6 Web SDK. Paysera is a popular payment method in the Baltics, allowing customers to pay directly from their bank account.

## 🏗️ Architecture Overview

- Loads PayPal Web SDK with Paysera component
- Checks eligibility for Paysera
- Creates a Paysera payment session with required fields (full name, email)
- Handles order creation, approval, cancellation, and errors
- Uses a popup flow for payment

## Features

- Paysera one-time payment integration
- Full name and email field validation
- Popup payment flow
- Eligibility checking for Paysera
- Error handling and user feedback

## 📋 Prerequisites

### 1. PayPal Developer Account Setup
- Sign up at [developer.paypal.com](https://developer.paypal.com)
- Create a PayPal app and get your **Client ID** and **Secret**
- Enable Paysera in your PayPal sandbox merchant account settings

### 2. System Requirements
- Node.js v20 or higher
- Server running on port 8080 (see `server/node/`)

## 🚀 Running the Demo

### Server Setup
1. `cd server/node`
2. `npm install`
3. Create a `.env` file with your PayPal credentials:
   ```env
   PAYPAL_SANDBOX_CLIENT_ID=your_client_id
   PAYPAL_SANDBOX_CLIENT_SECRET=your_client_secret
   ```
4. `npm start` (runs on http://localhost:8080)

### Client Setup
1. `cd client/components/payseraPayments/html`
2. `npm install`
3. `npm start` (runs on http://localhost:3000)

## How It Works

1. Loads PayPal SDK and initializes with Paysera component
2. Checks eligibility for Paysera
3. Renders full name and email fields
4. On button click, validates fields and creates an order
5. Launches Paysera popup for payment
6. Handles approval, cancellation, and errors

## Server Endpoints Required
- `GET /paypal-api/auth/browser-safe-client-token`
- `POST /paypal-api/checkout/orders/create`
- `POST /paypal-api/checkout/orders/:orderId/capture`

## Available Scripts
- `npm start` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run format` - Format code
- `npm run format:check` - Check code formatting

## Troubleshooting
- **Paysera not eligible:** Ensure testBuyerCountry is set to "LT" and Paysera is enabled in your PayPal account
- **Validation fails:** Make sure all fields are filled and visible
- **Popup doesn't open:** Check for popup blockers and valid order creation
- **Order creation fails:** Ensure server is running and credentials are correct

## Documentation
- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [PayPal Community](https://developer.paypal.com/community/)
