# PayPal SDK v6 - React Sample Integrations

Three React sample applications demonstrating different PayPal payment flows using the PayPal JavaScript SDK v6 and `@paypal/react-paypal-js`.

## Payment Flows

### [One-Time Payment](./oneTimePayment/)

Standard checkout with immediate payment capture. Supports PayPal, Venmo, Pay Later, Guest Card, and PayPal Credit.

**Use Cases:** E-commerce checkout, one-time transactions

### [Save Payment](./savePayment/)

Vault payment methods for future use without an immediate purchase. Supports PayPal Save and PayPal Credit Save.

**Use Cases:** Account onboarding, subscription setup, repeat customer checkout

### [Subscription](./subscription/)

Set up recurring billing for ongoing services. Supports PayPal Subscriptions.

**Use Cases:** Monthly/yearly subscriptions, memberships, recurring services

## Quick Start

**1. Start the backend server:**

```bash
cd server/node
npm install
npm start
```

Server runs on `http://localhost:8080`

**2. Start a payment flow:**

```bash
cd client/prebuiltPages/react/oneTimePayment  # or savePayment or subscription
npm install
npm start
```

Frontend runs on `http://localhost:3000` (oneTimePayment), `3001` (savePayment), or `3002` (subscription)

## What's Included

Each sample includes:

- Multi-page product checkout flow (Product → Cart → Checkout)
- Single-page demo with all payment buttons
- Error handling and recovery
- TypeScript support
- Loading states and payment modals
- Integration with Node.js backend

## Technology Stack

- **Frontend:** React 19.1 + TypeScript + Vite
- **PayPal SDK:** @paypal/react-paypal-js v9.0.0-alpha.5
- **Backend:** Node.js + Express + @paypal/paypal-server-sdk v2.1.0

## Documentation

Each payment flow has detailed documentation in its own README:

- [oneTimePayment/README.md](./oneTimePayment/README.md)
- [savePayment/README.md](./savePayment/README.md)
- [subscription/README.md](./subscription/README.md)

## Resources

- [PayPal Developer Documentation](https://developer.paypal.com/)
- [@paypal/react-paypal-js on npm](https://www.npmjs.com/package/@paypal/react-paypal-js)
- [@paypal/paypal-server-sdk on GitHub](https://github.com/paypal/PayPal-TypeScript-Server-SDK)
- [PayPal Sandbox Testing](https://developer.paypal.com/dashboard/accounts)
