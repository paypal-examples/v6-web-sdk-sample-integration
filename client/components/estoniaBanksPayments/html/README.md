# Estonia Banks One-Time Payment Integration

This demo shows how to integrate Estonia Banks payments using the PayPal v6 Web SDK. Estonia Banks enables customers to pay directly from their Estonian bank account.

## 🏗️ Architecture Overview

- Loads PayPal Web SDK with Estonia Banks component
- Checks eligibility for Estonia Banks
- Creates an Estonia Banks payment session with required fields (full name)
- Handles order creation, approval, cancellation, and errors
- Uses a popup flow for payment

## Features

- Estonia Banks one-time payment integration
- Full name field validation
- Popup payment flow
- Eligibility checking for Estonia Banks
- Error handling and user feedback

## 📋 Prerequisites

### 1. PayPal Developer Account Setup
- Sign up at [developer.paypal.com](https://developer.paypal.com)
- Create a PayPal app and get your **Client ID** and **Secret**
- Enable Estonia Banks in your PayPal sandbox merchant account settings

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
1. `cd client/components/estoniaBanksPayments/html`
2. `npm install`
3. `npm start` (runs on http://localhost:3000)

## How It Works

1. Loads PayPal SDK and initializes with Estonia Banks component
2. Checks eligibility for Estonia Banks
3. Renders full name field
4. On button click, validates field and creates an order
5. Launches Estonia Banks popup for payment
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
- **Estonia Banks not eligible:** Ensure testBuyerCountry is set to "EE" and Estonia Banks is enabled in your PayPal account
- **Validation fails:** Make sure the full name field is filled and visible
- **Popup doesn't open:** Check for popup blockers and valid order creation
- **Order creation fails:** Ensure server is running and credentials are correct

## Documentation
- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [PayPal Community](https://developer.paypal.com/community/)
