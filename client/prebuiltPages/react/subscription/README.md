# PayPal Subscription React Sample Integration

> **SDK Version**: PayPal JS SDK v6
> **Framework**: React 19.1 + TypeScript
> **Frontend Package**: @paypal/react-paypal-js v9.0.0-alpha.5
> **Backend Package**: @paypal/paypal-server-sdk v2.1.0
> **Payment Flow**: Recurring subscriptions
> **Demo**: Subscription billing setup and management
> **Live Demo**: [View on fly.dev](https://v6-web-sdk-sample-integration-server.fly.dev/client/prebuiltPages/react/subscription/dist/index.html)

This React sample application demonstrates how to integrate **recurring subscriptions** with PayPal's V6 Web SDK. Users set up automated billing for ongoing services or products.

## Live Demo

Try the deployed example without setting up locally:

**[View React Subscription Demo](https://v6-web-sdk-sample-integration-server.fly.dev/client/prebuiltPages/react/subscription/dist/index.html)**

This demo runs in PayPal sandbox mode - use [Sandbox test accounts](https://developer.paypal.com/dashboard/accounts) to complete transactions.

Browse all available examples at the [Examples Index](https://v6-web-sdk-sample-integration-server.fly.dev/).

## Supported Payment Methods

This sample demonstrates **subscription billing** where customers set up recurring payments:

- **PayPal Subscriptions** - Recurring billing

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
cd client/prebuiltPages/react/subscription
npm install
npm start
```

- **Frontend**: http://localhost:3002
- **Backend**: http://localhost:8080

The Vite dev server proxies `/paypal-api` requests to the backend server on port 8080.

## Project Structure

```
subscription/
├── src/
│   ├── App.tsx                        # Root app with PayPalProvider and routing
│   ├── main.tsx                       # React entry point
│   ├── utils.ts                       # API utilities (createSubscription)
│   ├── pages/
│   │   ├── ProductPage.tsx            # Product selection page
│   │   ├── CartPage.tsx               # Shopping cart page
│   │   ├── CheckoutPage.tsx           # Checkout with subscription buttons
│   │   ├── SinglePageDemo.tsx         # Single-page demo with all buttons
│   │   └── ErrorBoundaryTestPage.tsx  # Error handling demo
│   └── components/
│       ├── PayPalSubscriptionButton.tsx # Subscription button
│       ├── ProductDisplay.tsx         # Product information display
│       ├── PaymentModal.tsx           # Success/Cancel/Error modal
│       └── ErrorBoundary.tsx          # Error boundary component
├── index.html                         # HTML entry point
├── vite.config.ts                     # Vite config with proxy settings
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
  components={["paypal-subscriptions"]}
  pageType="checkout"
>
  <CheckoutPage />
</PayPalProvider>
```

The `components` prop specifies which payment methods to load:

- `paypal-subscriptions` - PayPal Subscriptions button

### 2. Payment Session Hooks

The subscription button uses a specialized hook to create a subscription session:

| Hook                                  | Button Type   |
| ------------------------------------- | ------------- |
| `usePayPalSubscriptionPaymentSession` | Subscriptions |

**Example Usage:**

```tsx
// src/components/PayPalSubscriptionButton.tsx
import {
  usePayPalSubscriptionPaymentSession,
  type UsePayPalSubscriptionPaymentSessionProps,
} from "@paypal/react-paypal-js/sdk-v6";

const PayPalSubscriptionButton = (
  props: UsePayPalSubscriptionPaymentSessionProps,
) => {
  const { handleClick } = usePayPalSubscriptionPaymentSession(props);

  return (
    <paypal-button
      type="subscribe"
      onClick={() => handleClick()}
    ></paypal-button>
  );
};
```

### 3. Subscription Flow

**Subscription Setup Flow:**

1. User clicks the subscription button
2. `handleClick()` starts the subscription session
3. `createSubscription` callback creates a subscription (product, plan, and subscription) via the backend API
4. PayPal opens the subscription agreement experience (popup/redirect)
5. Customer reviews and agrees to recurring billing terms
6. On approval, `onApprove` callback receives the subscription ID
7. Subscription is activated and first payment may be processed
8. Automatic billing occurs on scheduled intervals

## Backend Server

The Node.js backend handles sensitive PayPal API interactions.

**Location:** `server/node/`

**Package:** [@paypal/paypal-server-sdk](https://github.com/paypal/PayPal-TypeScript-Server-SDK) v2.1.0

**SDK Controllers:**

| Controller                     | Purpose                             |
| ------------------------------ | ----------------------------------- |
| `OAuthAuthorizationController` | Generate browser-safe client tokens |
| `SubscriptionsController`      | Create subscriptions and plans      |

**Key Files:**

| File                     | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `src/server.ts`          | Express server entry point and route definitions |
| `src/paypalServerSdk.ts` | PayPal SDK client configuration                  |

## Backend API Endpoints

| Endpoint                                     | Method | Description                                   |
| -------------------------------------------- | ------ | --------------------------------------------- |
| `/paypal-api/auth/browser-safe-client-token` | GET    | Fetches authentication token for SDK          |
| `/paypal-api/subscription`                   | POST   | Creates a subscription (product + plan + sub) |

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

| File                          | Purpose                                             |
| ----------------------------- | --------------------------------------------------- |
| `src/App.tsx`                 | SDK initialization with PayPalProvider              |
| `src/sections/SoccerBall.tsx` | Payment flow and button rendering                   |
| `src/utils.ts`                | Backend API calls (createOrder, captureOrder, etc.) |
| `index.html`                  | HTML entry point                                    |

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
