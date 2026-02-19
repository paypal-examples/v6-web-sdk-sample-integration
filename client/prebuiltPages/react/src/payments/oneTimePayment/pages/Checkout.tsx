import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  usePayPal,
  useEligibleMethods,
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
 * Eligibility: We call useEligibleMethods here to access eligibility from the provider reducer.
 * The fetch was started in Home.tsx (fire-and-forget), so data is likely
 * already in context. See README.md for details.
 */
const Checkout = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const { loadingStatus } = usePayPal();
  const navigate = useNavigate();

  // Access eligibility from provider reducer (pre-fetched in Home.tsx via fire-and-forget).
  const { error: eligibilityError } = useEligibleMethods();

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
  ) : eligibilityError ? (
    <div style={{ padding: "1rem", textAlign: "center", color: "red" }}>
      Failed to load payment options. Please refresh the page.
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
