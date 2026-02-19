# PayPal Multi-Flow React Sample Integration

> **SDK Version**: PayPal JS SDK v6
> **Framework**: React 19.1 + TypeScript
> **Frontend Package**: @paypal/react-paypal-js v9.0.0-alpha.6
> **Backend Package**: @paypal/paypal-server-sdk v2.1.0
> **Payment Methods**: PayPal, Venmo, Pay Later, Guest Card, Subscriptions, Save, Credit
> **Demo**: Multi-page checkout flows with routing

This React sample application demonstrates how to integrate different PayPal payment flows using PayPal's React component library, `react-paypal-js`.

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
| @paypal/react-paypal-js   | 9.0.0-alpha.6 | React hooks and Context provider for PayPal V6 SDK |
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
│   ├── utils.ts                   # Shared utilities for all payment flows
│   ├── types/
│   │   └── index.ts               # Shared TypeScript interfaces
│   ├── constants/
│   │   └── products.ts            # Client product catalog (all details except price)
│   ├── hooks/                     # Custom React hooks for code reuse
│   │   ├── useCartTotals.ts       # Hook for cart calculations (totalItems, total)
│   │   ├── useProducts.ts         # Hook for loading products with prices from server
│   │   └── useQuantityChange.ts   # Hook for handling product quantity updates
│   ├── pages/                     # Base components (shared across flows)
│   │   ├── Home.tsx               # Landing page with navigation
│   │   ├── BaseProduct.tsx        # Base product selection page
│   │   ├── BaseCart.tsx           # Base shopping cart page
│   │   ├── BaseCheckout.tsx       # Base checkout page
│   │   ├── BaseStaticButtons.tsx  # Base static buttons demo page
│   │   └── ErrorBoundary.tsx      # Error handling demo
│   ├── components/                # Shared UI components
│   │   ├── ProductDisplay.tsx     # Product grid display
│   │   ├── PaymentModal.tsx       # Success/error modal
│   │   ├── ErrorBoundary.tsx      # Error boundary component
│   │   └── ErrorTest.tsx          # Error test component
│   ├── styles/                    # Shared CSS
│   │   ├── Cart.css
│   │   ├── Checkout.css
│   │   ├── Modal.css
│   │   ├── Product.css
│   │   └── StaticButtons.css
│   ├── images/                    # Shared product images for all flows
│   │   ├── world-cup.jpg
│   │   ├── basket-ball.jpeg
│   │   ├── base-ball.jpeg
│   │   └── hockey-puck.jpeg
│   └── payments/                  # Flow-specific implementations
│       ├── oneTimePayment/
│       │   ├── pages/             # Flow wrappers (use Base components)
│       │   │   ├── Checkout.tsx
│       │   │   └── StaticButtons.tsx
│       │   └── components/        # Flow-specific payment buttons
│       │       ├── PayPalButton.tsx
│       │       ├── VenmoButton.tsx
│       │       ├── PayLaterButton.tsx
│       │       ├── PayPalBasicCardButton.tsx
│       │       └── PayPalCreditOneTimeButton.tsx
│       ├── savePayment/
│       │   ├── pages/
│       │   │   ├── Checkout.tsx
│       │   │   └── StaticButtons.tsx
│       │   └── components/
│       │       ├── PayPalSaveButton.tsx
│       │       └── PayPalCreditSaveButton.tsx
│       └── subscription/
│           ├── pages/
│           │   ├── Checkout.tsx
│           │   └── StaticButtons.tsx
│           └── components/
│               └── PayPalSubscriptionButton.tsx
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

### 2. Eligibility

This example uses `useEligibleMethods` to fetch and hydrate eligibility data at the top level.

#### How It Works (Fire-and-Forget Pattern)

```
Home.tsx (top-level component below PayPalProvider)
    │
    └── useEligibleMethods()  // Start fetch, don't block rendering
              │
              ├── Page renders immediately (no blocking)
              └── Eligibility fetches in background
                      │
                      ↓
        When user reaches Checkout:
              │
              └── PayLaterButton reads eligibility from context
                  (countryCode, productCode) - renders when ready
```

#### SDK Eligibility Hooks

| Hook                      | Environment | Use in this example? | Description                                                                                                                 |
| ------------------------- | ----------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `useEligibleMethods`      | Client-side | **Yes**              | Returns `{ eligiblePaymentMethods, isLoading, error }`. Fetches via SDK if context is empty, otherwise returns eligibility from the provider context. |
| `useFetchEligibleMethods` | Server-only | **No**               | For SSR frameworks only (Next.js, Remix). Requires `"server-only"` import. Do not use in client-side React apps.            |

#### Example

```tsx
// Home.tsx - fire-and-forget (start fetch early)
useEligibleMethods();

// Checkout.tsx - check for errors
const { error } = useEligibleMethods();
```

See `src/pages/Home.tsx` and `src/payments/oneTimePayment/pages/Checkout.tsx` for full implementation.

### 3. Payment Session Hooks

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

### 4. Payment Flow

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
| `/paypal-api/products`                                          | GET    | Returns product pricing (SKU → price mapping)     |
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

| File                              | Purpose                                            |
| --------------------------------- | -------------------------------------------------- |
| `src/App.tsx`                     | SDK initialization with PayPalProvider and routing |
| `src/pages/Home.tsx`              | Landing page with payment flow navigation          |
| `src/pages/Base*.tsx`             | Base components (shared UI and logic)              |
| `src/components/`                 | Shared UI components (ProductDisplay, Modal, etc.) |
| `src/types/index.ts`              | Shared TypeScript interfaces                       |
| `src/constants/products.ts`       | Product catalog data                               |
| `src/utils.ts`                    | Shared utilities                                   |
| `src/payments/*/pages/*.tsx`      | Flow wrappers (thin wrappers for Base components)  |
| `src/payments/*/components/*.tsx` | Flow-specific payment button components            |
| `index.html`                      | HTML entry point                                   |

### Backend Files

| File                                 | Purpose                         |
| ------------------------------------ | ------------------------------- |
| `server/node/src/server.ts`          | Express server entry point      |
| `server/node/src/paypalServerSdk.ts` | PayPal SDK client configuration |

### Common Tasks

| Task                         | Location                                              |
| ---------------------------- | ----------------------------------------------------- |
| Configure payment methods    | `App.tsx` - components array in PayPalProvider        |
| Add new payment flow         | Create wrapper in `src/payments/<flow>/pages/`        |
| Modify shared UI/logic       | Update Base components in `src/pages/`                |
| Add flow-specific button     | Create component in `src/payments/<flow>/components/` |
| Modify routing               | `App.tsx` - Routes configuration                      |
| Add shared components        | `src/components/` directory                           |
| Update product catalog       | `src/constants/products.ts`                           |
| Update TypeScript interfaces | `src/types/index.ts`                                  |
| Add custom hooks             | `src/hooks/` directory                                |

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
| @paypal/react-paypal-js   | 9.0.0-alpha.6 | React hooks and Context provider for PayPal V6 SDK |
| @paypal/paypal-server-sdk | 2.1.0         | Server-side PayPal API calls                       |
| react-router-dom          | 7.13.0        | Client-side routing                                |
