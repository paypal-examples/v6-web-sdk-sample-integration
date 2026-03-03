"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PayPalProvider,
  PayPalOneTimePaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";

const product = {
  name: "World Cup Ball",
  price: "75.00",
  sku: "1blwyeo8",
  quantity: 1,
};

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

type CheckoutState =
  | { status: "idle" }
  | { status: "success"; orderId: string }
  | { status: "error"; message: string }
  | { status: "cancelled" };

export default function CheckoutPage() {
  const [state, setState] = useState<CheckoutState>({ status: "idle" });

  async function createOrder(): Promise<{ orderId: string }> {
    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: [{ sku: product.sku, quantity: product.quantity }],
        }),
      }
    );
    const data = await response.json();
    return { orderId: data.id };
  }

  async function captureOrder({ orderId }: { orderId: string }) {
    const response = await fetch(
      `/paypal-api/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  }

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
            <Link
              href="/"
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Nav />

      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full">
          {/* Order Summary */}
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] mb-8">
            Checkout
          </h1>

          <div className="border border-[var(--border)] rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-[var(--background-secondary)] flex items-center justify-center shrink-0">
                <span className="text-2xl">⚽</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {product.name}
                </p>
                <p className="text-xs text-[var(--foreground-secondary)]">
                  Qty: {product.quantity}
                </p>
              </div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                ${product.price}
              </p>
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--foreground-secondary)]">
                  Total
                </span>
                <span className="text-lg font-semibold text-[var(--foreground)]">
                  ${product.price}
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
              onApprove={async (data) => {
                await captureOrder({ orderId: data.orderId });
                setState({ status: "success", orderId: data.orderId });
              }}
              onError={(error) => {
                setState({
                  status: "error",
                  message:
                    error instanceof Error
                      ? error.message
                      : "Something went wrong. Please try again.",
                });
              }}
              onCancel={() => {
                setState({ status: "cancelled" });
              }}
              presentationMode="auto"
            />
          </PayPalProvider>

          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              &larr; Back to product
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Nav() {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-[var(--border)]">
      <Link
        href="/"
        className="text-sm font-medium tracking-tight text-[var(--foreground)] hover:text-[var(--foreground-secondary)] transition-colors"
      >
        PayPal Store
      </Link>
      <span className="text-xs text-[var(--foreground-secondary)]">
        Next.js Demo
      </span>
    </nav>
  );
}
