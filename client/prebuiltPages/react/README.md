# PayPal Multi-Flow React Sample Integration

> **SDK Version**: PayPal JS SDK v6
> **Framework**: React 19.2.4 + TypeScript
> **Frontend Package**: @paypal/react-paypal-js v10.0.0
> **Backend Package**: @paypal/paypal-server-sdk v2.1.0
> **Payment Methods**: PayPal, Venmo, Pay Later, Guest Card, Subscriptions, Save, Credit, Apple Pay, Google Pay
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
- **PayPal Advanced Card** - Card payments with enhanced features and customization options
- **PayPal Subscriptions** - Recurring billing subscriptions
- **PayPal Save** - Vault payment methods without purchase
- **PayPal Credit** - PayPal Credit one-time and save payments
- **Apple Pay** - Native Apple Pay one-time payment flow in Safari
- **Google Pay** - Native Google Pay one-time payment flow in Chrome and other modern browsers

## Technology Stack

| Technology                | Version | Purpose                                            |
| ------------------------- | ------- | -------------------------------------------------- |
| React                     | 19.2.4  | UI framework                                       |
| Vite                      | 7.3.1   | Development server and bundler                     |
| TypeScript                | 5.9.3   | Type safety                                        |
| React Router DOM          | 7.13.0  | Client-side routing                                |
| @paypal/react-paypal-js   | 10.0.0  | React hooks and Context provider for PayPal V6 SDK |
| @paypal/paypal-server-sdk | 2.1.0   | Server-side PayPal API calls                       |
| react-error-boundary      | 6.1.0   | Error boundary component for React                 |

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

| Route                                    | Description                                      |
| ---------------------------------------- | ------------------------------------------------ |
| `/`                                      | Home page with navigation                        |
| `/one-time-payment`                      | One-Time Payment product page                    |
| `/one-time-payment/cart`                 | One-Time Payment cart page                       |
| `/one-time-payment/checkout`             | One-Time Payment checkout page                   |
| `/one-time-payment/error`                | One-Time Payment error boundary demo             |
| `/one-time-payment/card-fields`          | Card Fields One-Time Payment product page        |
| `/one-time-payment/card-fields/cart`     | Card Fields One-Time Payment cart page           |
| `/one-time-payment/card-fields/checkout` | Card Fields One-Time Payment checkout            |
| `/one-time-payment/apple-pay`            | Apple Pay one-time payment product page          |
| `/one-time-payment/apple-pay/cart`       | Apple Pay one-time payment cart page             |
| `/one-time-payment/apple-pay/checkout`   | Apple Pay one-time payment checkout              |
| `/one-time-payment/google-pay`           | Google Pay one-time payment product page         |
| `/one-time-payment/google-pay/cart`      | Google Pay one-time payment cart page            |
| `/one-time-payment/google-pay/checkout`  | Google Pay one-time payment checkout             |
| `/save-payment`                          | Save Payment (Vault only) payment method page    |
| `/save-payment/card-fields`              | Card Fields Save Payment method page             |
| `/subscription`                          | Subscription product page                        |
| `/subscription/cart`                     | Subscription cart page                           |
| `/subscription/checkout`                 | Subscription checkout page                       |
| `/subscription/error`                    | Subscription error boundary demo                 |
| `/vault-with-purchase`                   | Vault with Purchase (Save + Charge) product page |
| `/vault-with-purchase/cart`              | Vault with Purchase cart page                    |
| `/vault-with-purchase/checkout`          | Vault with Purchase checkout page                |
| `/vault-with-purchase/error`             | Vault with Purchase error boundary demo          |
| `/paypal-messages`                       | PayPal Messages promotional component demo       |
| `/error-boundary-test`                   | Standalone error handling demonstration          |

## Project Structure

```
react/
├── src/
│   ├── App.tsx                         # Main app with routing and PayPalProvider
│   ├── main.tsx                        # React entry point
│   ├── utils.ts                        # Shared utilities for all payment flows
│   ├── types/
│   │   └── index.ts                    # Shared TypeScript interfaces
│   ├── constants/
│   │   └── products.ts                 # Client product catalog
│   ├── hooks/                          # Custom React hooks for code reuse
│   │   ├── useCartTotals.ts            # Hook for cart calculations (totalItems, total)
│   │   ├── useProducts.ts              # Hook for loading products with prices from server
│   │   └── useQuantityChange.ts        # Hook for handling product quantity updates
│   ├── pages/                          # Base components (shared across flows)
│   │   ├── Home.tsx                    # Landing page with navigation
│   │   ├── BaseProduct.tsx             # Base product selection page
│   │   ├── BaseCart.tsx                # Base shopping cart page
│   │   ├── BaseCheckout.tsx            # Base checkout page
│   │   ├── BaseCardFieldsCheckout.tsx  # Base Card Fields checkout wrapper
│   │   ├── BaseStaticButtons.tsx       # Base static buttons demo page
│   │   ├── SavePaymentSettings.tsx     # Save Payment (Vault only) page
│   │   ├── CardFieldsSavePaymentSettings.tsx # Card Fields Save Payment page
│   │   └── ErrorBoundary.tsx           # Error handling demo page
│   ├── components/                     # Shared UI components
│   │   ├── ProductDisplay.tsx          # Product grid display
│   │   ├── PaymentModal.tsx            # Success/error modal
│   │   ├── ErrorBoundary.tsx           # Error boundary component
│   │   └── ErrorTest.tsx               # Error test component
│   ├── styles/                         # Shared CSS
│   │   ├── Cart.css
│   │   ├── Checkout.css
│   │   ├── Modal.css
│   │   ├── Product.css
│   │   └── StaticButtons.css
│   ├── images/                         # Product images
│   │   ├── world-cup.jpg
│   │   ├── basket-ball.jpeg
│   │   ├── base-ball.jpeg
│   │   └── hockey-puck.jpeg
│   ├── paymentFlowCheckoutPages/       # Payment flow wrapper components
│   │   ├── OneTimePaymentCheckout.tsx  # One-Time Payment checkout wrapper
│   │   ├── CardFieldsOneTimePaymentCheckout.tsx # Card Fields One-Time Payment wrapper
│   │   ├── ApplePayOneTimePaymentCheckout.tsx # Apple Pay one-time payment wrapper
│   │   ├── GooglePayOneTimePaymentCheckout.tsx # Google Pay one-time payment wrapper
│   │   ├── VaultWithPurchaseCheckout.tsx # Vault with Purchase checkout wrapper
│   │   └── SubscriptionCheckout.tsx    # Subscription checkout wrapper
│   ├── paypalMessages/                 # PayPal Messages feature
│   │   ├── PayPalMessages.tsx          # PayPal Messages component
│   │   └── PayPalMessagesDemo.tsx      # PayPal Messages demo page
│   └── payments/                       # Flow-specific implementations
│       ├── oneTimePayment/
│       │   └── components/
│       │       └── PayPalCardFieldsOneTimePayment.tsx
│       └── savePayment/
│           └── components/
│               └── PayPalCardFieldsSavePayment.tsx
├── index.html
├── vite.config.ts                      # Vite config with proxy settings
├── package.json
└── tsconfig.json
```

## How It Works

### 1. SDK Loading and Initialization

`PayPalProvider` from `@paypal/react-paypal-js` handles loading the PayPal V6 SDK scripts automatically. When mounted, it:

1. Loads the core SDK script from PayPal's CDN
2. Loads the component scripts specified in the `components` prop
3. Creates an SDK instance with the provided `clientId`
4. Makes the SDK available to child components via React Context

```tsx
// src/App.tsx
<PayPalProvider
  clientId={clientId}
  components={[
    "paypal-payments",
    "venmo-payments",
    "paypal-guest-payments",
    "paypal-subscriptions",
    "card-fields",
    "paypal-messages",
    "applepay-payments",
  ]}
  pageType="checkout"
>
  <RouterProvider router={router} />
</PayPalProvider>
```

The `components` prop specifies which payment methods and features to load:

- `paypal-payments` - PayPal and Pay Later buttons
- `venmo-payments` - Venmo button
- `paypal-guest-payments` - Guest card payment button
- `paypal-subscriptions` - Subscription buttons
- `card-fields` - Card Fields (advanced card payment UI)
- `paypal-messages` - PayPal Messages promotional component
- `applepay-payments` - Apple Pay button and one-time payment session support
- `googlepay-payments` - Google Pay button and one-time payment session support

### Apple Pay Requirements

The Apple Pay demo requires:

1. Safari on a supported Apple device
2. HTTPS origin (Apple Pay is blocked on insecure origins)
3. Apple Pay merchant/domain setup for the testing domain
4. Apple Pay JS loaded in `index.html`

```html
<script
  crossorigin
  src="https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js"
></script>
```

### Google Pay Requirements

The Google Pay demo requires:

1. Chrome or another modern browser that supports the Google Pay API
2. Google Pay JS loaded in `index.html` (must execute before the React bundle so `window.google.payments.api` is available when `useGooglePayOneTimePaymentSession` mounts)

```html
<script defer src="https://pay.google.com/gp/p/js/pay.js"></script>
```

### 2. Eligibility

Each checkout page uses `useEligibleMethods` to fetch eligibility data with the appropriate `paymentFlow` parameter.

#### SDK Eligibility Hooks

| Hook                      | Environment | Use in this example? | Description                                                                                                                                           |
| ------------------------- | ----------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useEligibleMethods`      | Client-side | **Yes**              | Returns `{ eligiblePaymentMethods, isLoading, error }`. Fetches via SDK if context is empty, otherwise returns eligibility from the provider context. |
| `useFetchEligibleMethods` | Server-only | **No**               | Requires `"server-only"` import. Do not use in client-side React apps.                                                                                |

#### useEligibleMethods Parameters

```typescript
type FindEligibleMethodsOptions = {
  amount?: string; // Transaction amount, e.g., "100.00"
  currencyCode?: string; // Currency code, e.g., "USD"
  paymentFlow?: PaymentFlow; // Payment flow type (see below)
};

type PaymentFlow =
  | "ONE_TIME_PAYMENT" // One-time payment (default)
  | "RECURRING_PAYMENT" // Subscription/recurring payments
  | "VAULT_WITH_PAYMENT" // Save payment method + charge immediately
  | "VAULT_WITHOUT_PAYMENT"; // Save payment method only (no charge)
```

#### paymentFlow by Page Type

| Page Type           | paymentFlow Value       | Description                              |
| ------------------- | ----------------------- | ---------------------------------------- |
| One-Time            | `ONE_TIME_PAYMENT`      | Standard checkout                        |
| Subscription        | `RECURRING_PAYMENT`     | Recurring/subscription payments          |
| Save Payment        | `VAULT_WITHOUT_PAYMENT` | Save payment method without charge       |
| Vault with Purchase | `VAULT_WITH_PAYMENT`    | Save payment method + charge immediately |

#### Example

```tsx
// Checkout.tsx - fetch eligibility with correct paymentFlow
const { error: eligibilityError } = useEligibleMethods({
  payload: {
    currencyCode: "USD",
    paymentFlow: "ONE_TIME_PAYMENT",
  },
});

// Use SDK loading state to control button visibility
const isLoading = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

if (isLoading) {
  return <div>Loading payment methods...</div>;
}

if (eligibilityError) {
  return <div>Failed to load payment options.</div>;
}

return <PayPalOneTimePaymentButton ... />;
```

See `src/payments/oneTimePayment/pages/Checkout.tsx` for full implementation.

### 2b. Vault with Purchase

**Vault with Purchase** combines vault functionality (saving payment methods) with an immediate charge. Unlike "Save Payment" which only saves without charging, this flow saves the payment method AND charges the customer in a single transaction.

**Use Case**: E-commerce scenarios where you want to offer customers the option to save their payment method while completing their purchase in one step.

**Implementation**: Uses `VAULT_WITH_PAYMENT` as the paymentFlow value. Routes include:

- `/vault-with-purchase` - Product selection
- `/vault-with-purchase/cart` - Shopping cart
- `/vault-with-purchase/checkout` - Payment processing
- `/vault-with-purchase/error` - Error boundary demo

See `src/paymentFlowCheckoutPages/VaultWithPurchaseCheckout.tsx` for the full implementation.

### 2c. PayPal Messages

**PayPal Messages** is a promotional messaging component that displays contextual messages to your customers about PayPal products and financing options. It's not a payment method itself, but a marketing tool to increase conversion by informing customers about available payment options.

**Implementation**:

- Component: `src/paypalMessages/PayPalMessages.tsx`
- Demo page: `/paypal-messages`

PayPal Messages automatically adapts messaging based on:

- Transaction amount
- Customer eligibility
- Available financing options

See `src/paypalMessages/PayPalMessagesDemo.tsx` for a complete example.

### 3. Payment Session Hooks

Each payment button uses a specialized hook to create a payment session:

| Hook                                   | Button Type         |
| -------------------------------------- | ------------------- |
| `usePayPalOneTimePaymentSession`       | PayPal              |
| `useVenmoOneTimePaymentSession`        | Venmo               |
| `usePayLaterOneTimePaymentSession`     | Pay Later           |
| `useApplePayOneTimePaymentSession`     | Apple Pay           |
| `useGooglePayOneTimePaymentSession`    | Google Pay          |
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

### 3.1 Payment Session Hooks - Card Fields

Card Fields provides specialized hooks to create payment sessions that work seamlessly with individual card field components:

| Hook                                       | Use Case            |
| ------------------------------------------ | ------------------- |
| `usePayPalCardFieldsOneTimePaymentSession` | One-time payment    |
| `usePayPalCardFieldsSavePaymentSession`    | Save payment method |

**Example Usage:**

```tsx
import {
  PayPalCardNumberField,
  PayPalCardExpiryField,
  PayPalCardCvvField,
  usePayPalCardFieldsOneTimePaymentSession,
} from "@paypal/react-paypal-js/sdk-v6";
import { useEffect } from "react";

const CardFieldsPayment = () => {
  const { submit, submitResponse } = usePayPalCardFieldsOneTimePaymentSession();

  const handleCreateOrder = async () => {
    return await createOrder();
  };

  const handleSubmit = async () => {
    const { orderId } = await handleCreateOrder();
    await submit(orderId);
  };

  useEffect(() => {
    if (!submitResponse) {
      return;
    }

    const { orderId, state } = submitResponse.data;

    switch (state) {
      case "succeeded":
        captureOrder({ orderId });
        break;
      case "failed":
        console.error(
          `One time payment failed: orderId: ${orderId}, message:  ${message}`,
        );
        break;
    }
  }, [submitResponse]);

  return (
    <>
      <PayPalCardNumberField placeholder="Enter card number" />
      <PayPalCardExpiryField placeholder="MM/YY" />
      <PayPalCardCvvField placeholder="Enter CVV" />
      <button onClick={handleSubmit}>Pay</button>
    </>
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

### 4.1 Payment Flow - Card Fields

1. Customer enters card information directly into the Card Fields components
2. User clicks the submit button
3. `createOrder` creates an order via the backend API
4. `submit(orderId)` processes the card payment with the order ID
5. `submitResponse` object gets updated with the payment result
6. Handle submit response based on payment result

### 4.2 Payment Flow - Apple Pay

1. Check availability (`ApplePaySession.canMakePayments()`) and HTTPS
2. Fetch eligibility/config with `useEligibleMethods` for `ONE_TIME_PAYMENT`
3. Render `ApplePayOneTimePaymentButton` with `applePayConfig`
4. During Apple Pay authorization, `createOrder` runs
5. `validateMerchant` and `confirmOrder` are handled by `useApplePayOneTimePaymentSession` internally
6. In `onApprove`, capture with `data.approveApplePayPayment.id`

### 4.3 Payment Flow - Google Pay

1. Fetch eligibility/config with `useEligibleMethods` for `ONE_TIME_PAYMENT`
2. Read the raw config via `eligiblePaymentMethods.getDetails("googlepay").config` (the React component formats it internally)
3. Render `GooglePayOneTimePaymentButton` with `googlePayConfig` and a `transactionInfo` payload
4. On button click, `createOrder` runs to create the PayPal order
5. The Google Pay payment sheet opens; on authorization, `useGooglePayOneTimePaymentSession` confirms the order with PayPal
6. In `onApprove`, capture with `data.id` (unless `status === "PAYER_ACTION_REQUIRED"`, which signals 3DS)

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
| `/paypal-api/auth/browser-safe-client-id`                       | GET    | Fetches client ID for SDK                         |
| `/paypal-api/products`                                          | GET    | Returns product pricing (SKU → price mapping)     |
| `/paypal-api/checkout/orders/create-order-for-one-time-payment` | POST   | Creates a PayPal order for one-time payment       |
| `/paypal-api/checkout/orders/{orderId}/capture`                 | POST   | Captures the approved payment                     |
| `/paypal-api/vault/create-setup-token-for-paypal-save-payment`  | POST   | Creates vault setup token for saving payment info |
| `/paypal-api/vault/create-payment-token/{vaultSetupToken}`      | POST   | Creates long-lived payment token from setup token |
| `/paypal-api/billing/create-subscription`                       | POST   | Creates a subscription                            |

## Resources

- [PayPal JS SDK V6 Documentation](https://docs.paypal.ai/payments/methods/paypal/sdk/js/v6/paypal-checkout)
- [PayPal JS SDK V6 Apple Pay Documentation](https://docs.paypal.ai/payments/methods/digital-wallets/apple-pay)
- [PayPal JS SDK V6 Google Pay Documentation](https://docs.paypal.ai/payments/methods/digital-wallets/google-pay)
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
  usePayPalCardFields,
  usePayPalOneTimePaymentSession,
  useVenmoOneTimePaymentSession,
  usePayLaterOneTimePaymentSession,
  usePayPalGuestPaymentSession,
  usePayPalSubscriptionPaymentSession,
  usePayPalSavePaymentSession,
  usePayPalCreditOneTimePaymentSession,
  usePayPalCreditSavePaymentSession,
  usePayPalCardFieldsOneTimePaymentSession,
  usePayPalCardFieldsSavePaymentSession,
} from "@paypal/react-paypal-js/sdk-v6";

// Loading state constants
import { INSTANCE_LOADING_STATE } from "@paypal/react-paypal-js/sdk-v6";
```

### Package Dependencies

| Package                   | Version | Purpose                                            |
| ------------------------- | ------- | -------------------------------------------------- |
| @paypal/react-paypal-js   | 10.0.0  | React hooks and Context provider for PayPal V6 SDK |
| @paypal/paypal-server-sdk | 2.1.0   | Server-side PayPal API calls                       |
| react-router-dom          | 7.13.0  | Client-side routing                                |
| react-error-boundary      | 6.1.0   | Error boundary wrapper for error handling          |
