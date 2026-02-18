import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  usePayPal,
  INSTANCE_LOADING_STATE,
  type OnApproveDataOneTimePayments,
  type OnErrorData,
  type OnCompleteData,
  type OnCancelDataOneTimePayments,
  PayPalOneTimePaymentButton,
  VenmoOneTimePaymentButton,
  PayLaterOneTimePaymentButton,
  PayPalGuestPaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";
import BaseCheckout from "../../../pages/BaseCheckout";
import type { ModalType, ModalContent, ProductItem } from "../../../types";
import { captureOrder, createOrder } from "../../../utils";

/**
 * Checkout page for one-time payments.
 *
 * ELIGIBILITY HOOKS:
 *
 * useEligibleMethods - Client-side hook that returns eligibility from context
 * OR fetches via SDK if not available. It will:
 *   1. Return eligibility from PayPalProvider context (if already hydrated), or
 *   2. Make an SDK call to fetch eligibility if not available in context.
 * Use this at the top of checkout flow when you need client-side eligibility.
 *
 * Example:
 *   const { eligiblePaymentMethods, isLoading } = useEligibleMethods();
 *   if (isLoading) return <Spinner />;
 *   // Use eligiblePaymentMethods to conditionally render payment buttons
 *
 * useFetchEligibleMethods - Server-only function for SSR/Next.js server
 * components. Use this to pre-fetch eligibility server-side and pass to
 * PayPalProvider via eligibleMethodsResponse prop. This is a context
 * pass-through pattern - the provider holds the data, useEligibleMethods
 * reads it without making additional network calls.
 *
 * Example (server component):
 *   const response = await useFetchEligibleMethods({ clientToken, environment });
 *   <PayPalProvider eligibleMethodsResponse={response} ... />
 */
const Checkout = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const { loadingStatus } = usePayPal();
  const navigate = useNavigate();

  const handleCreateOrder = async () => {
    const savedCart = sessionStorage.getItem("cart");
    const products: ProductItem[] = savedCart ? JSON.parse(savedCart) : [];

    const cart = products.map((product) => ({
      sku: product.sku,
      quantity: product.quantity,
    }));

    return await createOrder(cart);
  };

  const handlePaymentCallbacks = {
    onApprove: async (data: OnApproveDataOneTimePayments) => {
      console.log("Payment approved:", data);
      const captureResult = await captureOrder({ orderId: data.orderId });
      console.log("Payment capture result:", captureResult);

      sessionStorage.removeItem("cart");
      setModalState("success");
    },

    onCancel: (data: OnCancelDataOneTimePayments) => {
      console.log("Payment cancelled:", data);
      setModalState("cancel");
    },

    onError: (data: OnErrorData) => {
      console.error("Payment error:", data);
      setModalState("error");
    },

    onComplete: (data: OnCompleteData) => {
      console.log("Payment session completed");
      console.log("On Complete data:", data);
    },
  };

  const getModalContent = useCallback(
    (state: ModalType): ModalContent | null => {
      switch (state) {
        case "success":
          return {
            title: "Payment Successful! 🎉",
            message: "Thank you for your purchase!",
          };
        case "cancel":
          return {
            title: "Payment Cancelled",
            message: "Your payment was cancelled.",
          };
        case "error":
          return {
            title: "Payment Error",
            message:
              "There was an error processing your payment. Please try again.",
          };
        default:
          return null;
      }
    },
    [],
  );

  const isSDKLoading = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

  const handleModalClose = () => {
    setModalState(null);
    if (modalState === "success") {
      navigate("/");
    }
  };

  const paymentButtons = isSDKLoading ? (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      Loading payment methods...
    </div>
  ) : (
    <>
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
    </>
  );

  return (
    <BaseCheckout
      flowType="one-time-payment"
      modalState={modalState}
      onModalClose={handleModalClose}
      getModalContent={getModalContent}
      paymentButtons={paymentButtons}
    />
  );
};

export default Checkout;
