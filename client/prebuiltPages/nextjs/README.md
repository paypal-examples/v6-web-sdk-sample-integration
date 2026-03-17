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
3. **Environment Configuration** — Copy `.env.example` to `.env` in this directory and add your PayPal sandbox credentials:
   ```bash
   cp .env.example .env
   ```
   Then fill in `PAYPAL_SANDBOX_CLIENT_ID` and `PAYPAL_SANDBOX_CLIENT_SECRET` from the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).

## How to Run Locally

**Step 1 — Set up environment variables:**

```bash
cd client/prebuiltPages/nextjs
cp .env.example .env
# Edit .env and add your PAYPAL_SANDBOX_CLIENT_ID and PAYPAL_SANDBOX_CLIENT_SECRET
```

**Step 2 — Start the Next.js application:**

```bash
npm install
npm run dev
```

- **Frontend**: http://localhost:3000

> The Next.js app calls the PayPal API directly via server actions — no separate backend server is needed.

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

`PayPalProvider` from `@paypal/react-paypal-js` handles loading the PayPal V6 SDK. The `clientId` is fetched via a Server Action (`src/actions/paypal.ts`), then passed to the provider:

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

All PayPal API calls are consolidated in `src/actions/paypal.ts` as Server Actions that call the PayPal API directly using `@paypal/paypal-server-sdk`. See `getBrowserSafeClientId`, `createOrder`, and `captureOrder`.

## PayPal API Integration

The Next.js app integrates with PayPal directly via server actions in `src/actions/paypal.ts`, using `@paypal/paypal-server-sdk`. No separate backend server is required.

**Environment variables** (set in `client/prebuiltPages/nextjs/.env`):

| Variable                       | Description                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `PAYPAL_SANDBOX_CLIENT_ID`     | PayPal sandbox client ID — used to initialize the PayPal JS SDK              |
| `PAYPAL_SANDBOX_CLIENT_SECRET` | PayPal sandbox client secret — used server-side to create and capture orders |

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
