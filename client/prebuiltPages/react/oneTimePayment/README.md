# PayPal One-Time Payment React Sample Integration

> **SDK Version**: PayPal JS SDK v6
> **Framework**: React 19.1 + TypeScript
> **Frontend Package**: @paypal/react-paypal-js v9.0.0-alpha.5
> **Backend Package**: @paypal/paypal-server-sdk v2.1.0
> **Payment Methods**: PayPal, Venmo, Pay Later, Guest Card
> **Demo**: Product checkout flow ($100 Soccer Ball)
> **Live Demo**: [View on fly.dev](https://v6-web-sdk-sample-integration-server.fly.dev/client/prebuiltPages/react/oneTimePayment/dist/index.html)

This React sample application demonstrates how to integrate with PayPal's V6 Web SDK. The example simulates a product checkout flow for a World Cup Soccer Ball ($100) and supports multiple payment methods.

## Live Demo

Try the deployed example without setting up locally:

**[View React One-Time Payment Demo](https://v6-web-sdk-sample-integration-server.fly.dev/client/prebuiltPages/react/oneTimePayment/dist/index.html)**

This demo runs in PayPal sandbox mode - use [Sandbox test accounts](https://developer.paypal.com/dashboard/accounts) to complete transactions.

Browse all available examples at the [Examples Index](https://v6-web-sdk-sample-integration-server.fly.dev/).

## Supported Payment Methods

- **PayPal** - Standard PayPal checkout
- **Venmo** - Standard Venmo Payments
- **Pay Later** - PayPal's buy now, pay later option
- **PayPal Basic Card** - Guest card payments without a PayPal account

## Technology Stack

| Technology                | Version       | Purpose                                            |
| ------------------------- | ------------- | -------------------------------------------------- |
| React                     | 19.1.0        | UI framework                                       |
| Vite                      | 7.x           | Development server and bundler                     |
| TypeScript                | 5.8.x         | Type safety                                        |
| @paypal/react-paypal-js   | 9.0.0-alpha.5 | React hooks and Context provider for PayPal V6 SDK |
| @paypal/paypal-server-sdk | 2.1.0         | Server-side PayPal API calls                       |
| react-error-boundary      | 6.0.0         | Graceful error handling                            |

## Prerequisites

1. **Node.js** - Version 20 or higher
2. **PayPal Developer Account** - Required for sandbox credentials
3. **Environment Configuration** - See the [root README](../../../../README.md) for instructions on setting up your `.env` file with `PAYPAL_SANDBOX_CLIENT_ID` and `PAYPAL_SANDBOX_CLIENT_SECRET`

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
cd client/prebuiltPages/react/oneTimePayment
npm install
npm start
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080

The Vite dev server proxies `/paypal-api` requests to the backend server on port 8080.

## Project Structure

```
oneTimePayment/
├── src/
│   ├── App.tsx                      # Root app with PayPalProvider
│   ├── main.tsx                     # React entry point
│   ├── utils.ts                     # API utilities (createOrder, captureOrder)
│   ├── sections/
│   │   └── SoccerBall.tsx           # Main checkout page with payment buttons
│   └── components/
│       ├── PayPalButton.tsx         # PayPal button wrapper
│       ├── VenmoButton.tsx          # Venmo button wrapper
│       ├── PayLaterButton.tsx       # Pay Later button wrapper
│       ├── PayPalBasicCardButton.tsx # Guest card payment button
│       ├── ProductDisplay.tsx       # Product information display
│       └── PaymentModal.tsx         # Success/Cancel/Error modal
├── index.html                       # HTML entry point
├── vite.config.ts                   # Vite config with proxy settings
└── package.json
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
  components={["paypal-payments", "venmo-payments", "paypal-guest-payments"]}
  pageType="checkout"
>
  <SoccerBall />
</PayPalProvider>
```

The `components` prop specifies which payment methods to load:

- `paypal-payments` - PayPal and Pay Later buttons
- `venmo-payments` - Venmo button
- `paypal-guest-payments` - Guest card payment button

### 2. Payment Session Hooks

Each payment button uses a specialized hook to create a payment session:

| Hook                               | Button Type |
| ---------------------------------- | ----------- |
| `usePayPalOneTimePaymentSession`   | PayPal      |
| `useVenmoOneTimePaymentSession`    | Venmo       |
| `usePayLaterOneTimePaymentSession` | Pay Later   |
| `usePayPalGuestPaymentSession`     | Basic Card  |

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

| Controller                     | Purpose                             |
| ------------------------------ | ----------------------------------- |
| `OAuthAuthorizationController` | Generate browser-safe client tokens |
| `OrdersController`             | Create and capture orders           |
| `VaultController`              | Store payment methods (optional)    |

**Key Files:**

| File                     | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `src/server.ts`          | Express server entry point and route definitions |
| `src/paypalServerSdk.ts` | PayPal SDK client configuration                  |

## Backend API Endpoints

| Endpoint                                              | Method | Description                             |
| ----------------------------------------------------- | ------ | --------------------------------------- |
| `/paypal-api/auth/browser-safe-client-token`          | GET    | Fetches authentication token for SDK    |
| `/paypal-api/checkout/orders/create-with-sample-data` | POST   | Creates a PayPal order with sample data |
| `/paypal-api/checkout/orders/{orderId}/capture`       | POST   | Captures the approved payment           |

## Error Handling

This sample uses [react-error-boundary](https://github.com/bvaughn/react-error-boundary) for graceful error handling. If the SDK fails to load or a payment error occurs, users see a friendly error message with a retry option.

## Resources

- [PayPal JS SDK V6 Documentation](https://docs.paypal.ai/payments/methods/paypal/sdk/js/v6/paypal-checkout)
- [@paypal/react-paypal-js on npm](https://www.npmjs.com/package/@paypal/react-paypal-js)
- [@paypal/paypal-server-sdk on GitHub](https://github.com/paypal/PayPal-TypeScript-Server-SDK)
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- [PayPal Sandbox Test Accounts](https://developer.paypal.com/dashboard/accounts)
- [PayPal Sandbox Card Testing](https://developer.paypal.com/tools/sandbox/card-testing/)
- [react-error-boundary](https://github.com/bvaughn/react-error-boundary)

---

## Quick Reference

**Purpose**: React sample demonstrating PayPal V6 SDK one-time payment integration with Node.js backend

### Frontend Files

| File                          | Purpose                                       |
| ----------------------------- | --------------------------------------------- |
| `src/App.tsx`                 | SDK initialization with PayPalProvider        |
| `src/sections/SoccerBall.tsx` | Payment flow and button rendering             |
| `src/utils.ts`                | Backend API calls (createOrder, captureOrder) |
| `index.html`                  | HTML entry point                              |

### Backend Files

| File                                 | Purpose                         |
| ------------------------------------ | ------------------------------- |
| `server/node/src/server.ts`          | Express server entry point      |
| `server/node/src/paypalServerSdk.ts` | PayPal SDK client configuration |

### Common Tasks

| Task                      | Location                                              |
| ------------------------- | ----------------------------------------------------- |
| Configure payment methods | `App.tsx` - components array                          |
| Add new button type       | `src/components/` - create wrapper using session hook |
| Modify order creation     | `src/utils.ts` - createOrder function                 |
| Change product data       | `server/node/src/paypalServerSdk.ts`                  |

### Import Paths

```tsx
// SDK Provider and hooks
import { PayPalProvider } from "@paypal/react-paypal-js/sdk-v6";
import {
  usePayPal,
  usePayPalOneTimePaymentSession,
} from "@paypal/react-paypal-js/sdk-v6";

// Loading state constants
import { INSTANCE_LOADING_STATE } from "@paypal/react-paypal-js/sdk-v6";
```

### Package Dependencies

| Package                   | Version       | Purpose                                            |
| ------------------------- | ------------- | -------------------------------------------------- |
| @paypal/react-paypal-js   | 9.0.0-alpha.5 | React hooks and Context provider for PayPal V6 SDK |
| @paypal/paypal-server-sdk | 2.1.0         | Server-side PayPal API calls                       |
