# PayPal Next.js Sample Integration

> **SDK Version**: PayPal JS SDK v6
> **Framework**: Next.js 15 + React 19 + TypeScript
> **Frontend Package**: @paypal/react-paypal-js v9.0.1
> **Backend Package**: @paypal/paypal-server-sdk v2.2.0 (shared Express server)
> **Payment Methods**: PayPal (one-time payment)
> **Demo**: Single-page checkout with product showcase and inline success state

This Next.js sample application demonstrates how to integrate a PayPal one-time payment flow using `@paypal/react-paypal-js` with the App Router and `clientId` initialization.

## Supported Payment Methods

- **PayPal** — Standard one-time payment via `PayPalOneTimePaymentButton`

## Technology Stack

| Technology                | Version | Purpose                                              |
| ------------------------- | ------- | ---------------------------------------------------- |
| Next.js                   | 15.x    | Full-stack React framework (App Router)              |
| React                     | 19.x    | UI framework                                         |
| TypeScript                | 5.8.x   | Type safety                                          |
| Tailwind CSS              | 4.x     | Styling                                              |
| @paypal/react-paypal-js   | 9.0.1   | React components and hooks for PayPal V6 SDK         |
| @paypal/paypal-server-sdk | 2.2.0   | Server-side PayPal API calls (shared Express server) |

## Prerequisites

1. **Node.js** — Version 18 or higher
2. **PayPal Developer Account** — Required for sandbox credentials
3. **Environment Configuration** — See the [root README](../../../README.md) for instructions on setting up your `.env` file with `PAYPAL_SANDBOX_CLIENT_ID` and `PAYPAL_SANDBOX_CLIENT_SECRET`

## How to Run Locally

This sample requires two servers running concurrently: the shared Node.js backend API and the Next.js frontend.

**Terminal 1 — Start the backend server:**

```bash
cd server/node
npm install
npm start
```

**Terminal 2 — Start the Next.js application:**

```bash
cd client/prebuiltPages/nextjs
npm install
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080

The Next.js dev server proxies `/paypal-api` requests to the backend server on port 8080 via `next.config.ts` rewrites.

## Application Routes

| Route | Description                                                                |
| ----- | -------------------------------------------------------------------------- |
| `/`   | Product showcase (left) + checkout with PayPal button (right), single page |

## Project Structure

```
nextjs/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with metadata
│   │   ├── globals.css             # Tailwind CSS and design tokens
│   │   └── page.tsx                # Product showcase + checkout (single page)
│   └── lib/
│       ├── product.ts              # Product data constant
│       └── utils.ts                # API utility functions (createOrder, captureOrder)
├── public/                         # Static assets
├── next.config.ts                  # Rewrites for API proxy to Express server
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── .env.local                      # NEXT_PUBLIC_PAYPAL_CLIENT_ID
├── .env.example                    # Environment variable template
└── README.md
```

## How It Works

### 1. SDK Loading and Initialization

`PayPalProvider` from `@paypal/react-paypal-js` handles loading the PayPal V6 SDK scripts automatically. This template uses `clientId` initialization (no server-generated client token required).

```tsx
// src/app/page.tsx
<PayPalProvider clientId={PAYPAL_CLIENT_ID} components={["paypal-payments"]}>
  <PayPalOneTimePaymentButton
    createOrder={createOrder}
    onApprove={handleApprove}
    onCancel={handleCancel}
    onError={handleError}
    onComplete={handleComplete}
    presentationMode="auto"
  />
</PayPalProvider>
```

The `components` prop specifies which payment methods to load:

- `paypal-payments` — PayPal checkout button

### 2. Payment Flow

1. Single page renders product checkout
2. `PayPalProvider` initializes with `clientId` and renders `PayPalOneTimePaymentButton`
3. User clicks the PayPal button
4. `createOrder` callback creates an order via the backend API
5. PayPal opens the checkout experience (popup/modal)
6. On approval, `onApprove` callback captures the order via the backend
7. `onComplete` callback logs the payment session state
8. Inline success message replaces the page with the order ID

### 3. Order Creation and Capture

Orders are created and captured through the shared Express server. The Next.js app proxies requests via `next.config.ts` rewrites:

```tsx
// createOrder — called when user clicks the PayPal button
async function createOrder(): Promise<{ orderId: string }> {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-one-time-payment",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart: [{ sku: "1blwyeo8", quantity: 1 }],
      }),
    },
  );
  const data = await response.json();
  return { orderId: data.id };
}

// captureOrder — called after user approves payment
async function captureOrder(orderId: string) {
  const response = await fetch(
    `/paypal-api/checkout/orders/${orderId}/capture`,
    { method: "POST", headers: { "Content-Type": "application/json" } },
  );
  return response.json();
}
```

## Backend Server

The Node.js backend handles sensitive PayPal API interactions. This template reuses the shared Express server from the repository root.

**Location:** `server/node/`

**Package:** [@paypal/paypal-server-sdk](https://github.com/paypal/PayPal-TypeScript-Server-SDK) v2.2.0

## Backend API Endpoints Used

| Endpoint                                                        | Method | Description                                 |
| --------------------------------------------------------------- | ------ | ------------------------------------------- |
| `/paypal-api/checkout/orders/create-order-for-one-time-payment` | POST   | Creates a PayPal order for one-time payment |
| `/paypal-api/checkout/orders/{orderId}/capture`                 | POST   | Captures the approved payment               |

## Deploy on Vercel

- TBD

> **Note:** The Vercel deployment requires a separate backend for order creation and capture. For a fully self-contained deployment, API routes can be added to the Next.js app as a follow-up.

## Resources

- [PayPal JS SDK V6 Documentation](https://docs.paypal.ai/payments/methods/paypal/sdk/js/v6/paypal-checkout)
- [@paypal/react-paypal-js on npm](https://www.npmjs.com/package/@paypal/react-paypal-js)
- [@paypal/paypal-server-sdk on GitHub](https://github.com/paypal/PayPal-TypeScript-Server-SDK)
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- [PayPal Sandbox Test Accounts](https://developer.paypal.com/dashboard/accounts)
- [PayPal Sandbox Card Testing](https://developer.paypal.com/tools/sandbox/card-testing/)

---

## Quick Reference

**Purpose**: Next.js sample demonstrating PayPal V6 SDK one-time payment integration with App Router

### Frontend Files

| File                  | Purpose                                           |
| --------------------- | ------------------------------------------------- |
| `src/app/layout.tsx`  | Root layout with metadata                         |
| `src/app/globals.css` | Tailwind CSS and design tokens                    |
| `src/app/page.tsx`    | Product showcase + checkout with PayPal button    |
| `src/lib/product.ts`  | Product data constant                             |
| `src/lib/utils.ts`    | API utility functions (createOrder, captureOrder) |
| `next.config.ts`      | API proxy rewrites to Express server              |

### Import Paths

```tsx
// SDK Provider, components, and callback types
import {
  PayPalProvider,
  PayPalOneTimePaymentButton,
  type OnApproveDataOneTimePayments,
  type OnCancelDataOneTimePayments,
  type OnCompleteData,
  type OnErrorData,
} from "@paypal/react-paypal-js/sdk-v6";
```

### Package Dependencies

| Package                 | Version | Purpose                                      |
| ----------------------- | ------- | -------------------------------------------- |
| @paypal/react-paypal-js | 9.0.1   | React components and hooks for PayPal V6 SDK |
| next                    | 15.x    | Full-stack React framework                   |
| react                   | 19.x    | UI framework                                 |
| tailwindcss             | 4.x     | Styling                                      |
