# PayPal Multi-Flow React Sample Integration

> **SDK Version**: PayPal JS SDK v6
> **Framework**: React 19.2.5 + TypeScript
> **Frontend Package**: @paypal/react-paypal-js v10.1.0
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

- PayPal
- Venmo
- Pay Later
- PayPal Basic Card (guest card)
- PayPal Advanced Card (Card Fields)
- PayPal Subscriptions
- PayPal Save (vault without purchase)
- PayPal Credit
- Apple Pay
- Google Pay

## Technology Stack

| Technology                | Version | Purpose                                            |
| ------------------------- | ------- | -------------------------------------------------- |
| React                     | 19.2.5  | UI framework                                       |
| Vite                      | 8.0.8   | Development server and bundler                     |
| TypeScript                | 6.0.2   | Type safety                                        |
| React Router DOM          | 7.14.0  | Client-side routing                                |
| @paypal/react-paypal-js   | 10.1.0  | React hooks and Context provider for PayPal V6 SDK |
| @paypal/paypal-server-sdk | 2.1.0   | Server-side PayPal API calls                       |
| react-error-boundary      | 6.1.1   | Error boundary component for React                 |

## Prerequisites

1. **Node.js** - Version 20.19+ (required by Vite 8)
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

## Exploring the Sample

Run the app and open the Home page (`/`) — it links to every flow. To read the code, browse
`client/prebuiltPages/react/src/`: the per-flow checkout wrappers that leverage the `react-paypal-js` package live in
`src/paymentFlowCheckoutPages/`, routing and SDK setup in `src/App.tsx`.

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
    "googlepay-payments",
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

#### Example

`useEligibleMethods` returns `eligiblePaymentMethods`, whose `isEligible(...)` gates buttons that are
not universally available (e.g. Pay Later, Credit). Always-available buttons (PayPal, Venmo, Guest)
render unconditionally.

```tsx
// OneTimePaymentCheckout.tsx
const { error: eligibilityError, eligiblePaymentMethods } = useEligibleMethods({
  payload: {
    currencyCode: "USD",
    paymentFlow: "ONE_TIME_PAYMENT",
  },
});

if (eligibilityError) {
  return <div>Failed to load eligible payment methods.</div>;
}

const isPayLaterEligible = eligiblePaymentMethods?.isEligible("paylater");

return (
  <>
    <PayPalOneTimePaymentButton {...props} />
    {isPayLaterEligible && <PayLaterOneTimePaymentButton {...props} />}
  </>
);
```

See `src/paymentFlowCheckoutPages/OneTimePaymentCheckout.tsx` for the full implementation.

### 2b. Vault with Purchase

Uses `VAULT_WITH_PAYMENT` as the `paymentFlow` value to save the payment method and charge in one
transaction. See `src/paymentFlowCheckoutPages/VaultWithPurchaseCheckout.tsx`.

### 2c. PayPal Messages

The `paypal-messages` component renders promotional messaging. See
`src/paypalMessages/PayPalMessages.tsx` (component) and `src/paypalMessages/PayPalMessagesDemo.tsx`
(demo page, route `/paypal-messages`).

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
