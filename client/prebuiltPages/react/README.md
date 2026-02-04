# PayPal Multi-Flow React Sample Integration

> **SDK Version**: PayPal JS SDK v6
> **Framework**: React 19.1 + TypeScript
> **Frontend Package**: @paypal/react-paypal-js v9.0.0-alpha.5
> **Backend Package**: @paypal/paypal-server-sdk v2.1.0
> **Payment Methods**: PayPal, Venmo, Pay Later, Guest Card, Subscriptions, Save, Credit
> **Demo**: Multi-page checkout flows with routing

This React sample application demonstrates how to integrate three different PayPal payment flows using the PayPal V6 Web SDK in a single unified application.

## Live Demo

Try the deployed example without setting up locally:

**[View React Multi-Flow Demo](https://v6-web-sdk-sample-integration-server.fly.dev/client/prebuiltPages/react/dist/index.html)**

This demo runs in PayPal sandbox mode - use [Sandbox test accounts](https://developer.paypal.com/dashboard/accounts) to complete transactions.

Browse all available examples at the [Examples Index](https://v6-web-sdk-sample-integration-server.fly.dev/).

## Supported Payment Methods

- **PayPal** - Standard PayPal checkout
- **Venmo** - Standard Venmo Payments
- **Pay Later** - PayPal's buy now, pay later option
- **PayPal Basic Card** - Guest card payments without a PayPal account
- **PayPal Subscriptions** - Recurring billing subscriptions
- **PayPal Save** - Vault payment methods without purchase
- **PayPal Credit** - PayPal Credit one-time and save payments

## Technology Stack

| Technology                | Version       | Purpose                                            |
| ------------------------- | ------------- | -------------------------------------------------- |
| React                     | 19.1.0        | UI framework                                       |
| Vite                      | 7.x           | Development server and bundler                     |
| TypeScript                | 5.8.x         | Type safety                                        |
| React Router DOM          | 7.13.0        | Client-side routing                                |
| @paypal/react-paypal-js   | 9.0.0-alpha.5 | React hooks and Context provider for PayPal V6 SDK |
| @paypal/paypal-server-sdk | 2.1.0         | Server-side PayPal API calls                       |

## Prerequisites

1. **Node.js** - Version 20 or higher
2. **PayPal Developer Account** - Required for sandbox credentials
3. **Environment Configuration** - See the [root README](../../../README.md) for instructions on setting up your `.env` file with `PAYPAL_SANDBOX_CLIENT_ID` and `PAYPAL_SANDBOX_CLIENT_SECRET`

## How to Run Locally

This sample requires two servers running concurrently: the Node.js backend API and the React frontend.

**Terminal 1 - Start the backend server:**

```bash
cd server/node
npm install
npm start
```

**Terminal 2 - Start the React application:**

```bash
cd client/prebuiltPages/react
npm install
npm start
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080

The Vite dev server proxies `/paypal-api` requests to the backend server on port 8080.

## Application Routes

| Route                           | Description                                     |
| ------------------------------- | ----------------------------------------------- |
| `/`                             | Home page with links to all three payment flows |
| `/one-time-payment`             | One-Time Payment product page                   |
| `/one-time-payment/cart`        | One-Time Payment cart page                      |
| `/one-time-payment/checkout`    | One-Time Payment checkout page                  |
| `/one-time-payment/static-demo` | One-Time Payment static buttons demo            |
| `/save-payment`                 | Save Payment product page                       |
| `/save-payment/cart`            | Save Payment cart page                          |
| `/save-payment/checkout`        | Save Payment checkout page                      |
| `/save-payment/static-demo`     | Save Payment static buttons demo                |
| `/subscription`                 | Subscription product page                       |
| `/subscription/cart`            | Subscription cart page                          |
| `/subscription/checkout`        | Subscription checkout page                      |
| `/subscription/static-demo`     | Subscription static buttons demo                |
| `/error-boundary-test`          | Error handling demonstration                    |

## Project Structure

```
react/
├── src/
│   ├── App.tsx                    # Main app with routing and PayPalProvider
│   ├── main.tsx                   # React entry point
│   ├── utils.ts                   # Shared utilities
│   ├── pages/
│   │   ├── HomePage.tsx           # Landing page with navigation
│   │   └── ErrorBoundaryTestPage.tsx  # Error handling demo
│   ├── components/                # Shared components
│   │   ├── ErrorBoundary.tsx
│   │   └── ErrorTest.tsx
│   ├── styles/                    # Shared CSS
│   │   ├── CartPage.css
│   │   ├── CheckoutPage.css
│   │   ├── Modal.css
│   │   ├── ProductPage.css
│   │   └── SoccerBall.css
│   └── payments/
│       ├── oneTimePayment/
│       │   ├── pages/
│       │   │   ├── ProductPage.tsx
│       │   │   ├── CartPage.tsx
│       │   │   ├── CheckoutPage.tsx
│       │   │   └── StaticButtonsDemo.tsx
│       │   ├── components/
│       │   │   ├── Modal.tsx
│       │   │   ├── PaymentButton.tsx
│       │   │   └── PayPalButton.tsx
│       │   ├── images/
│       │   └── utils.ts           # Flow-specific utilities
│       ├── savePayment/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── images/
│       │   └── utils.ts
│       └── subscription/
│           ├── pages/
│           ├── components/
│           ├── images/
│           └── utils.ts
├── index.html
├── vite.config.ts                 # Vite config with proxy settings
├── package.json
└── tsconfig.json
```

## How It Works

### 1. SDK Loading and Initialization

`PayPalProvider` from `@paypal/react-paypal-js` handles loading the PayPal V6 SDK scripts automatically. When mounted, it:

1. Loads the core SDK script from PayPal's CDN
2. Loads the component scripts specified in the `components` prop
3. Creates an SDK instance with the provided `clientToken`
4. Makes the SDK available to child components via React Context

```tsx
// src/App.tsx
<PayPalProvider
  clientToken={clientToken}
  components={[
    "paypal-payments",
    "venmo-payments",
    "paypal-guest-payments",
    "paypal-subscriptions",
  ]}
  pageType="checkout"
>
  <RouterProvider router={router} />
</PayPalProvider>
```

The `components` prop specifies which payment methods to load:

- `paypal-payments` - PayPal and Pay Later buttons
- `venmo-payments` - Venmo button
- `paypal-guest-payments` - Guest card payment button
- `paypal-subscriptions` - Subscription buttons

### 2. Payment Session Hooks

Each payment button uses a specialized hook to create a payment session:

| Hook                                   | Button Type         |
| -------------------------------------- | ------------------- |
| `usePayPalOneTimePaymentSession`       | PayPal              |
| `useVenmoOneTimePaymentSession`        | Venmo               |
| `usePayLaterOneTimePaymentSession`     | Pay Later           |
| `usePayPalGuestPaymentSession`         | Basic Card          |
| `usePayPalSubscriptionPaymentSession`  | Subscriptions       |
| `usePayPalSavePaymentSession`          | Save Payment Method |
| `usePayPalCreditOneTimePaymentSession` | Credit (One-time)   |
| `usePayPalCreditSavePaymentSession`    | Credit (Save)       |

**Example Usage:**

```tsx
import {
  usePayPalOneTimePaymentSession,
  type UsePayPalOneTimePaymentSessionProps,
} from "@paypal/react-paypal-js/sdk-v6";

const PayPalButton = (props: UsePayPalOneTimePaymentSessionProps) => {
  const { handleClick } = usePayPalOneTimePaymentSession(props);

  return (
    <paypal-button type="pay" onClick={() => handleClick()}></paypal-button>
  );
};
```

### 3. Payment Flow

1. User clicks a payment button
2. `handleClick()` starts the payment session
3. `createOrder` callback creates an order via the backend API
4. PayPal opens the checkout experience (popup/modal)
5. On approval, `onApprove` callback captures the order via the backend
6. Success/error modal displays the result

## Backend Server

The Node.js backend handles sensitive PayPal API interactions.

**Location:** `server/node/`

**Package:** [@paypal/paypal-server-sdk](https://github.com/paypal/PayPal-TypeScript-Server-SDK) v2.1.0

**SDK Controllers:**

| Controller                     | Purpose                                       |
| ------------------------------ | --------------------------------------------- |
| `OAuthAuthorizationController` | Generate browser-safe client tokens           |
| `OrdersController`             | Create and capture orders                     |
| `SubscriptionsController`      | Create subscriptions and billing plans        |
| `VaultController`              | Store payment methods (save without purchase) |

**Key Files:**

| File                     | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `src/server.ts`          | Express server entry point and route definitions |
| `src/paypalServerSdk.ts` | PayPal SDK client configuration                  |

## Backend API Endpoints

| Endpoint                                                        | Method | Description                                       |
| --------------------------------------------------------------- | ------ | ------------------------------------------------- |
| `/paypal-api/auth/browser-safe-client-token`                    | GET    | Fetches authentication token for SDK              |
| `/paypal-api/checkout/orders/create-order-for-one-time-payment` | POST   | Creates a PayPal order for one-time payment       |
| `/paypal-api/checkout/orders/{orderId}/capture`                 | POST   | Captures the approved payment                     |
| `/paypal-api/vault/create-setup-token-for-paypal-save-payment`  | POST   | Creates vault setup token for saving payment info |
| `/paypal-api/vault/create-payment-token/{vaultSetupToken}`      | POST   | Creates long-lived payment token from setup token |
| `/paypal-api/billing/create-subscription`                       | POST   | Creates a subscription                            |

## Resources

- [PayPal JS SDK V6 Documentation](https://docs.paypal.ai/payments/methods/paypal/sdk/js/v6/paypal-checkout)
- [@paypal/react-paypal-js on npm](https://www.npmjs.com/package/@paypal/react-paypal-js)
- [@paypal/paypal-server-sdk on GitHub](https://github.com/paypal/PayPal-TypeScript-Server-SDK)
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- [PayPal Sandbox Test Accounts](https://developer.paypal.com/dashboard/accounts)
- [PayPal Sandbox Card Testing](https://developer.paypal.com/tools/sandbox/card-testing/)

---

## Quick Reference

**Purpose**: React multi-flow sample demonstrating PayPal V6 SDK integration with routing and shared components

### Frontend Files

| File                      | Purpose                                            |
| ------------------------- | -------------------------------------------------- |
| `src/App.tsx`             | SDK initialization with PayPalProvider and routing |
| `src/pages/HomePage.tsx`  | Landing page with payment flow navigation          |
| `src/utils.ts`            | Shared utilities                                   |
| `src/payments/*/pages/`   | Flow-specific pages (Product, Cart, Checkout)      |
| `src/payments/*/utils.ts` | Flow-specific API calls                            |
| `index.html`              | HTML entry point                                   |

### Backend Files

| File                                 | Purpose                         |
| ------------------------------------ | ------------------------------- |
| `server/node/src/server.ts`          | Express server entry point      |
| `server/node/src/paypalServerSdk.ts` | PayPal SDK client configuration |

### Common Tasks

| Task                      | Location                                       |
| ------------------------- | ---------------------------------------------- |
| Configure payment methods | `App.tsx` - components array in PayPalProvider |
| Add new payment flow      | Create new directory under `src/payments/`     |
| Modify routing            | `App.tsx` - router configuration               |
| Add shared components     | `src/components/` directory                    |
| Update flow-specific code | `src/payments/<flow-name>/` directory          |

### Import Paths

```tsx
// SDK Provider and hooks
import { PayPalProvider } from "@paypal/react-paypal-js/sdk-v6";
import {
  usePayPal,
  usePayPalOneTimePaymentSession,
  useVenmoOneTimePaymentSession,
  usePayLaterOneTimePaymentSession,
  usePayPalGuestPaymentSession,
  usePayPalSubscriptionPaymentSession,
  usePayPalSavePaymentSession,
  usePayPalCreditOneTimePaymentSession,
  usePayPalCreditSavePaymentSession,
} from "@paypal/react-paypal-js/sdk-v6";

// Loading state constants
import { INSTANCE_LOADING_STATE } from "@paypal/react-paypal-js/sdk-v6";
```

### Package Dependencies

| Package                   | Version       | Purpose                                            |
| ------------------------- | ------------- | -------------------------------------------------- |
| @paypal/react-paypal-js   | 9.0.0-alpha.5 | React hooks and Context provider for PayPal V6 SDK |
| @paypal/paypal-server-sdk | 2.1.0         | Server-side PayPal API calls                       |
| react-router-dom          | 7.13.0        | Client-side routing                                |
