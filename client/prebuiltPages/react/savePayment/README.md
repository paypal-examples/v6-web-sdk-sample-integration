# PayPal Save Payment React Sample Integration

> **SDK Version**: PayPal JS SDK v6
> **Framework**: React 19.1 + TypeScript
> **Frontend Package**: @paypal/react-paypal-js v9.0.0-alpha.5
> **Backend Package**: @paypal/paypal-server-sdk v2.1.0
> **Payment Flow**: Save payment methods (vaulting)
> **Demo**: Vault payment information for future use
> **Live Demo**: [View on fly.dev](https://v6-web-sdk-sample-integration-server.fly.dev/client/prebuiltPages/react/savePayment/dist/index.html)

This React sample application demonstrates how to **save payment methods** (vaulting) with PayPal's V6 Web SDK.

## Live Demo

Try the deployed example without setting up locally:

**[View React Save Payment Demo](https://v6-web-sdk-sample-integration-server.fly.dev/client/prebuiltPages/react/savePayment/dist/index.html)**

This demo runs in PayPal sandbox mode - use [Sandbox test accounts](https://developer.paypal.com/dashboard/accounts) to complete transactions.

Browse all available examples at the [Examples Index](https://v6-web-sdk-sample-integration-server.fly.dev/).

## Supported Payment Methods

This sample demonstrates **payment vaulting** where customers save payment information for future use:

- **PayPal Save** - Save PayPal account for future transactions
- **PayPal Credit Save** - Save PayPal Credit account for future purchases

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
cd client/prebuiltPages/react/savePayment
npm install
npm start
```

- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:8080

The Vite dev server proxies `/paypal-api` requests to the backend server on port 8080.

## Project Structure

```
savePayment/
├── src/
│   ├── App.tsx                        # Root app with PayPalProvider and routing
│   ├── main.tsx                       # React entry point
│   ├── utils.ts                       # API utilities (createVaultToken)
│   ├── pages/
│   │   ├── ProductPage.tsx            # Product selection page
│   │   ├── CartPage.tsx               # Shopping cart page
│   │   ├── CheckoutPage.tsx           # Checkout with save payment buttons
│   │   ├── SinglePageDemo.tsx         # Single-page demo with all buttons
│   │   └── ErrorBoundaryTestPage.tsx  # Error handling demo
│   └── components/
│       ├── PayPalSaveButton.tsx       # PayPal save payment button
│       ├── PayPalCreditSaveButton.tsx # Credit save payment button
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
  components={["paypal-payments"]}
  pageType="checkout"
>
  <CheckoutPage />
</PayPalProvider>
```

The `components` prop specifies which payment methods to load:

- `paypal-payments` - PayPal Save and PayPal Credit Save buttons

### 2. Payment Session Hooks

Each save payment button uses a specialized hook to create a vaulting session:

| Hook                                | Button Type |
| ----------------------------------- | ----------- |
| `usePayPalSavePaymentSession`       | PayPal Save |
| `usePayPalCreditSavePaymentSession` | Credit Save |

**Example Usage:**

```tsx
// src/components/PayPalSaveButton.tsx
import {
  usePayPalSavePaymentSession,
  type UsePayPalSavePaymentSessionProps,
} from "@paypal/react-paypal-js/sdk-v6";

const PayPalSaveButton = (props: UsePayPalSavePaymentSessionProps) => {
  const { handleClick } = usePayPalSavePaymentSession(props);

  return (
    <paypal-button type="save" onClick={() => handleClick()}></paypal-button>
  );
};
```

### 3. Payment Vaulting Flow

**Save Payment Flow:**

1. User clicks a save payment button
2. `handleClick()` starts the vaulting session
3. `createVaultSetupToken` callback creates a vault setup token via the backend API
4. PayPal opens the authorization experience (popup/redirect)
5. Customer authorizes saving their payment method
6. On approval, `onApprove` callback receives the vault setup token
7. Backend creates a long-lived payment token from the setup token
8. Payment token can be used for future transactions

## Backend Server

The Node.js backend handles sensitive PayPal API interactions.

**Location:** `server/node/`

**Package:** [@paypal/paypal-server-sdk](https://github.com/paypal/PayPal-TypeScript-Server-SDK) v2.1.0

**SDK Controllers:**

| Controller                     | Purpose                             |
| ------------------------------ | ----------------------------------- |
| `OAuthAuthorizationController` | Generate browser-safe client tokens |
| `VaultController`              | Store payment methods (vaulting)    |

**Key Files:**

| File                     | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `src/server.ts`          | Express server entry point and route definitions |
| `src/paypalServerSdk.ts` | PayPal SDK client configuration                  |

## Backend API Endpoints

| Endpoint                                     | Method | Description                                       |
| -------------------------------------------- | ------ | ------------------------------------------------- |
| `/paypal-api/auth/browser-safe-client-token` | GET    | Fetches authentication token for SDK              |
| `/paypal-api/vault/setup-token/create`       | POST   | Creates vault setup token for saving payment info |
| `/paypal-api/vault/payment-token/create`     | POST   | Creates long-lived payment token from setup token |

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

**Purpose**: React sample demonstrating PayPal V6 SDK payment vaulting (save payment methods) with Node.js backend

### Frontend Files

| File                           | Purpose                                |
| ------------------------------ | -------------------------------------- |
| `src/App.tsx`                  | SDK initialization with PayPalProvider |
| `src/pages/ProductPage.tsx`    | Product selection (multi-page flow)    |
| `src/pages/CartPage.tsx`       | Shopping cart (multi-page flow)        |
| `src/pages/CheckoutPage.tsx`   | Checkout with save payment buttons     |
| `src/pages/SinglePageDemo.tsx` | Single-page demo with all buttons      |
| `src/utils.ts`                 | Backend API calls (createVaultToken)   |
| `index.html`                   | HTML entry point                       |

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
| Modify vault setup        | `src/utils.ts` - createVaultToken function            |
| Handle vault approval     | `src/components/` - onApprove callback                |

### Import Paths

```tsx
// SDK Provider and hooks
import { PayPalProvider } from "@paypal/react-paypal-js/sdk-v6";
import {
  usePayPal,
  usePayPalSavePaymentSession,
} from "@paypal/react-paypal-js/sdk-v6";

// Loading state constants
import { INSTANCE_LOADING_STATE } from "@paypal/react-paypal-js/sdk-v6";
```

### Package Dependencies

| Package                   | Version       | Purpose                                            |
| ------------------------- | ------------- | -------------------------------------------------- |
| @paypal/react-paypal-js   | 9.0.0-alpha.5 | React hooks and Context provider for PayPal V6 SDK |
| @paypal/paypal-server-sdk | 2.1.0         | Server-side PayPal API calls                       |
