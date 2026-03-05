"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PayPalProvider,
  PayPalOneTimePaymentButton,
  VenmoOneTimePaymentButton,
  PayLaterOneTimePaymentButton,
  PayPalGuestPaymentButton,
  usePayPal,
  useEligibleMethods,
  INSTANCE_LOADING_STATE,
  type OnApproveDataOneTimePayments,
  type OnCancelDataOneTimePayments,
  type OnCompleteData,
  type OnErrorData,
} from "@paypal/react-paypal-js/sdk-v6";
import Nav from "@/components/Nav";
import { PRODUCT, getCart, clearCart, type CartItem } from "@/lib/product";
import { createOrder, captureOrder } from "@/lib/utils";
import { getBrowserSafeClientId } from "@/actions/paypal";

type PaymentStatus = "idle" | "success" | "cancel" | "error";

const PaymentButtons = ({
  cart,
  onStatusChange,
}: {
  cart: CartItem;
  onStatusChange: (status: PaymentStatus) => void;
}) => {
  const { loadingStatus } = usePayPal();
  const { error: eligibilityError } = useEligibleMethods({
    payload: {
      currencyCode: "USD",
      paymentFlow: "ONE_TIME_PAYMENT",
    },
  });

  const isLoading = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

  const handleCreateOrder = async () => {
    return await createOrder([{ sku: cart.sku, quantity: cart.quantity }]);
  };

  const handlePaymentCallbacks = {
    onApprove: async (data: OnApproveDataOneTimePayments) => {
      console.log("Payment approved:", data);
      const captureResult = await captureOrder({ orderId: data.orderId });
      console.log("Payment capture result:", captureResult);
      clearCart();
      onStatusChange("success");
    },

    onCancel: (data: OnCancelDataOneTimePayments) => {
      console.log("Payment cancelled:", data);
      onStatusChange("cancel");
    },

    onError: (data: OnErrorData) => {
      console.error("Payment error:", data);
      onStatusChange("error");
    },

    onComplete: (data: OnCompleteData) => {
      console.log("Payment session completed:", data);
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
        <span className="ml-3 text-sm text-[var(--foreground-secondary)]">
          Loading payment methods...
        </span>
      </div>
    );
  }

  if (eligibilityError) {
    return (
      <div className="py-8 text-center text-sm text-[var(--error)]">
        Failed to load payment options. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <PayPalOneTimePaymentButton
        createOrder={handleCreateOrder}
        presentationMode="auto"
        {...handlePaymentCallbacks}
      />

      <VenmoOneTimePaymentButton
        createOrder={handleCreateOrder}
        presentationMode="auto"
        {...handlePaymentCallbacks}
      />

      <PayLaterOneTimePaymentButton
        createOrder={handleCreateOrder}
        presentationMode="auto"
        {...handlePaymentCallbacks}
      />

      <PayPalGuestPaymentButton
        createOrder={handleCreateOrder}
        {...handlePaymentCallbacks}
      />
    </div>
  );
};

const Checkout = () => {
  const [cart, setCart] = useState<CartItem | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const router = useRouter();

  useEffect(() => {
    const saved = getCart();
    if (!saved) {
      router.replace("/");
      return;
    }
    setCart(saved);
    getBrowserSafeClientId().then(setClientId);
  }, [router]);

  if (!cart || !clientId) return null;

  const subtotal = (parseFloat(PRODUCT.price) * cart.quantity).toFixed(2);

  return (
    <main className="min-h-screen flex flex-col">
      <Nav />

      <section className="flex-1 flex flex-col items-center px-6 py-16">
        <div className="max-w-lg w-full">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] mb-10">
            Checkout
          </h1>

          {status === "idle" ? (
            <>
              {/* Order Summary */}
              <div className="mb-8">
                <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--foreground-secondary)] mb-4">
                  Order Summary
                </h2>

                <div className="flex items-center gap-4 py-4 border-t border-[var(--border)]">
                  <div className="w-16 h-16 rounded-xl bg-[var(--background-secondary)] flex items-center justify-center shrink-0">
                    <span className="text-2xl">⚽</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {PRODUCT.name}
                    </p>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Qty: {cart.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    ${subtotal}
                  </p>
                </div>

                <div className="flex items-center justify-between py-4 border-t border-[var(--border)]">
                  <span className="text-base font-medium text-[var(--foreground)]">
                    Total
                  </span>
                  <span className="text-base font-medium text-[var(--foreground)]">
                    ${subtotal}
                  </span>
                </div>
              </div>

              {/* Payment Buttons */}
              <PayPalProvider
                clientId={clientId}
                components={[
                  "paypal-payments",
                  "venmo-payments",
                  "paypal-guest-payments",
                ]}
                pageType="checkout"
              >
                <PaymentButtons cart={cart} onStatusChange={setStatus} />
              </PayPalProvider>
            </>
          ) : (
            <div className="text-center py-16">
              {status === "success" && (
                <>
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
                    <span className="text-3xl">✓</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-2">
                    Payment Successful
                  </h2>
                  <p className="text-base text-[var(--foreground-secondary)] mb-8">
                    Thank you for your purchase.
                  </p>
                </>
              )}

              {status === "cancel" && (
                <>
                  <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-2">
                    Payment Cancelled
                  </h2>
                  <p className="text-base text-[var(--foreground-secondary)] mb-8">
                    Your payment was cancelled.
                  </p>
                </>
              )}

              {status === "error" && (
                <>
                  <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-2">
                    Payment Error
                  </h2>
                  <p className="text-base text-[var(--foreground-secondary)] mb-8">
                    There was an error processing your payment. Please try
                    again.
                  </p>
                </>
              )}

              <button
                onClick={() => router.push("/")}
                className="inline-block px-8 py-3 rounded-full bg-[var(--accent)] text-white text-base font-medium hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="w-full px-6 py-6 border-t border-[var(--border)] text-center">
        <p className="text-xs text-[var(--foreground-secondary)]">
          Powered by PayPal &middot; Built with Next.js
        </p>
      </footer>
    </main>
  );
};

export default Checkout;
