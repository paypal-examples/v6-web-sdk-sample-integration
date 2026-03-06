# PayPal Next.js Sample Integration

> **SDK Version**: PayPal JS SDK v6
> **Framework**: Next.js 16 + React 19 + TypeScript
> **Frontend Package**: @paypal/react-paypal-js v9.0.1
> **Backend Package**: @paypal/paypal-server-sdk v2.2.0 (shared Express server)
> **Payment Methods**: PayPal, Venmo, Pay Later, BCDC (Guest)
> **Demo**: 3-page checkout flow (Product → Cart → Checkout)

This Next.js sample application demonstrates how to integrate the [PayPal JS SDK](https://docs.paypal.ai/developer/how-to/sdk/js/v6/configuration) using `@paypal/react-paypal-js` with the App Router. The `clientId` is fetched from the server via a Server Action.

## Supported Payment Methods

- **PayPal** — Standard one-time payment via `PayPalOneTimePaymentButton`
- **Venmo** — Venmo one-time payment via `VenmoOneTimePaymentButton`
- **Pay Later** — Pay Later one-time payment via `PayLaterOneTimePaymentButton`
- **BCDC (Guest)** — Card payment via `PayPalGuestPaymentButton`

## Technology Stack

| Technology                | Version | Purpose                                              |
| ------------------------- | ------- | ---------------------------------------------------- |
| Next.js                   | 16.x    | Full-stack React framework (App Router)              |
| React                     | 19.x    | UI framework                                         |
| TypeScript                | 5.8.x   | Type safety                                          |
| Tailwind CSS              | 4.x     | Styling                                              |
| @paypal/react-paypal-js   | 9.0.1   | React components and hooks for PayPal V6 SDK         |
| @paypal/paypal-server-sdk | 2.2.0   | Server-side PayPal API calls (shared Express server) |

## Prerequisites

1. **Node.js** — Version 20 or higher
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

All PayPal API calls are handled via Server Actions that communicate directly with the backend server.

## Application Routes

| Route       | Description                                                 |
| ----------- | ----------------------------------------------------------- |
| `/`         | Product page with quantity selector and "Add to Bag" button |
| `/cart`     | Cart page to review item, update quantity, and proceed      |
| `/checkout` | Checkout page with order summary and PayPal payment buttons |

## Project Structure

```
nextjs/
├── src/
│   ├── actions/
│   │   └── paypal.ts              # Server Actions (clientId, createOrder, captureOrder)
│   ├── app/
│   │   ├── layout.tsx             # Root layout with metadata
│   │   ├── globals.css            # Tailwind CSS and design tokens
│   │   ├── page.tsx               # Product page with quantity selector
│   │   ├── cart/
│   │   │   └── page.tsx           # Cart page with item review
│   │   └── checkout/
│   │       └── page.tsx           # Checkout page with PayPal buttons
│   ├── components/
│   │   └── Nav.tsx                # Shared navigation component
│   └── lib/
│       ├── config.ts              # Shared configuration (API_BASE)
│       └── product.ts             # Product data and cart helpers (sessionStorage)
├── public/                        # Static assets
├── next.config.ts                 # Next.js configuration
├── package.json
├── tsconfig.json
├── postcss.config.mjs
└── README.md
```

## How It Works

### 1. SDK Loading and Initialization

`PayPalProvider` from `@paypal/react-paypal-js` handles loading the PayPal V6 SDK. The `clientId` is fetched from the Express server via a Server Action (`src/actions/paypal.ts`), then passed to the provider:

```tsx
<PayPalProvider
  clientId={clientId}
  components={["paypal-payments", "venmo-payments", "paypal-guest-payments"]}
  pageType="checkout"
>
  <PaymentButtons cart={cart} onStatusChange={setStatus} />
</PayPalProvider>
```

The `components` prop specifies which payment methods to load:

- `paypal-payments` — PayPal and Pay Later buttons
- `venmo-payments` — Venmo button
- `paypal-guest-payments` — BCDC (card) button

### 2. Payment Flow

1. User selects quantity on the product page (`/`) and clicks "Add to Bag"
2. Cart is saved to `sessionStorage` and user navigates to the cart page (`/cart`)
3. User reviews the item and clicks "Check Out" to navigate to checkout (`/checkout`)
4. `PayPalProvider` initializes with `clientId` fetched via Server Action
5. `useEligibleMethods` checks payment method eligibility
6. User clicks a payment button (PayPal, Venmo, Pay Later, or Card)
7. `createOrder` Server Action creates an order via the backend API
8. PayPal opens the checkout experience
9. On approval, `onApprove` captures the order via the `captureOrder` Server Action
10. `onComplete` callback logs the payment session state
11. Inline success message replaces the checkout form

### 3. Order Creation and Capture

All PayPal API calls are consolidated in `src/actions/paypal.ts` as Server Actions that call the shared Express server. See `getBrowserSafeClientId`, `createOrder`, and `captureOrder`.

## Backend Server

The Node.js backend handles sensitive PayPal API interactions. This template reuses the shared Express server from the repository root.

**Location:** `server/node/`

**Package:** [@paypal/paypal-server-sdk](https://github.com/paypal/PayPal-TypeScript-Server-SDK) v2.2.0

## Backend API Endpoints Used

| Endpoint                                                        | Method | Description                                 |
| --------------------------------------------------------------- | ------ | ------------------------------------------- |
| `/paypal-api/auth/browser-safe-client-id`                       | GET    | Returns the PayPal sandbox client ID        |
| `/paypal-api/checkout/orders/create-order-for-one-time-payment` | POST   | Creates a PayPal order for one-time payment |
| `/paypal-api/checkout/orders/{orderId}/capture`                 | POST   | Captures the approved payment               |

## Resources

- [PayPal JS SDK V6 Documentation](https://docs.paypal.ai/payments/methods/paypal/sdk/js/v6/paypal-checkout)
- [@paypal/react-paypal-js on npm](https://www.npmjs.com/package/@paypal/react-paypal-js)
- [@paypal/paypal-server-sdk on GitHub](https://github.com/paypal/PayPal-TypeScript-Server-SDK)
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- [PayPal Sandbox Test Accounts](https://developer.paypal.com/dashboard/accounts)
- [PayPal Sandbox Card Testing](https://developer.paypal.com/tools/sandbox/card-testing/)

---

## Quick Reference

All SDK components and hooks are imported from `@paypal/react-paypal-js/sdk-v6`. See `src/app/checkout/page.tsx` for the full integration example.
