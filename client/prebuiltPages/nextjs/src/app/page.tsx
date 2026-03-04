"use client";

import { useState } from "react";
import {
  PayPalProvider,
  PayPalOneTimePaymentButton,
  type OnApproveDataOneTimePayments,
  type OnCancelDataOneTimePayments,
  type OnCompleteData,
  type OnErrorData,
} from "@paypal/react-paypal-js/sdk-v6";
import { PRODUCT } from "@/lib/product";
import { createOrder, captureOrder } from "@/lib/utils";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

type CheckoutState =
  | { status: "idle" }
  | { status: "success"; orderId: string }
  | { status: "error"; message: string }
  | { status: "cancelled" };

const Home = () => {
  const [state, setState] = useState<CheckoutState>({ status: "idle" });

  if (state.status === "success") {
    return (
      <main className="min-h-screen flex flex-col">
        <Nav />
        <section className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#34c75920] flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[var(--success)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-2">
              Payment Successful
            </h1>
            <p className="text-sm text-[var(--foreground-secondary)] mb-1">
              Your order has been confirmed.
            </p>
            <p className="text-xs text-[var(--foreground-secondary)] mb-8 font-mono">
              Order ID: {state.orderId}
            </p>
            <button
              onClick={() => setState({ status: "idle" })}
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Continue Shopping
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Nav />

      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left — Product */}
          <div className="text-center lg:text-left">
            <div className="w-48 h-48 mx-auto lg:mx-0 mb-8 rounded-full bg-[var(--background-secondary)] flex items-center justify-center">
              <span className="text-7xl">⚽</span>
            </div>

            <p className="text-sm font-medium tracking-widest uppercase text-[var(--accent)] mb-3">
              New
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] mb-3">
              {PRODUCT.name}
            </h1>
            <p className="text-xl font-light text-[var(--foreground-secondary)] mb-4">
              {PRODUCT.tagline}
            </p>
            <p className="text-sm leading-relaxed text-[var(--foreground-secondary)] max-w-md">
              {PRODUCT.description}
            </p>
          </div>

          {/* Right — Checkout */}
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] mb-6">
              Checkout
            </h2>

            <div className="border border-[var(--border)] rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--background-secondary)] flex items-center justify-center shrink-0">
                  <span className="text-xl">⚽</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {PRODUCT.name}
                  </p>
                  <p className="text-xs text-[var(--foreground-secondary)]">
                    Qty: {PRODUCT.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  ${PRODUCT.price}
                </p>
              </div>

              <div className="border-t border-[var(--border)] pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--foreground-secondary)]">
                    Total
                  </span>
                  <span className="text-lg font-semibold text-[var(--foreground)]">
                    ${PRODUCT.price}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {state.status === "error" && (
              <div className="mb-6 p-4 rounded-xl bg-[#ff3b3010] border border-[#ff3b3040]">
                <p className="text-sm text-[var(--error)]">{state.message}</p>
              </div>
            )}

            {state.status === "cancelled" && (
              <div className="mb-6 p-4 rounded-xl bg-[var(--background-secondary)]">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  Payment was cancelled. You can try again below.
                </p>
              </div>
            )}

            {/* PayPal Button */}
            <PayPalProvider
              clientId={PAYPAL_CLIENT_ID}
              components={["paypal-payments"]}
            >
              <PayPalOneTimePaymentButton
                createOrder={createOrder}
                onApprove={async (data: OnApproveDataOneTimePayments) => {
                  console.log("Payment approved:", data);
                  await captureOrder({ orderId: data.orderId });
                  setState({ status: "success", orderId: data.orderId });
                }}
                onError={(data: OnErrorData) => {
                  console.error("Payment error:", data);
                  setState({
                    status: "error",
                    message: data.message,
                  });
                }}
                onCancel={(data: OnCancelDataOneTimePayments) => {
                  console.log("Payment cancelled:", data);
                  setState({ status: "cancelled" });
                }}
                onComplete={(data: OnCompleteData) => {
                  console.log("Payment session completed:", data);
                }}
                presentationMode="auto"
              />
            </PayPalProvider>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-6 border-t border-[var(--border)] text-center">
        <p className="text-xs text-[var(--foreground-secondary)]">
          Powered by PayPal &middot; Built with Next.js
        </p>
      </footer>
    </main>
  );
};

const Nav = () => {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-[var(--border)]">
      <span className="text-sm font-medium tracking-tight text-[var(--foreground)]">
        PayPal Store
      </span>
      <span className="text-xs text-[var(--foreground-secondary)]">
        Next.js Demo
      </span>
    </nav>
  );
};

export default Home;
