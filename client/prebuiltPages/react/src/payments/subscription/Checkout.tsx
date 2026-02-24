import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  usePayPal,
  useEligibleMethods,
  INSTANCE_LOADING_STATE,
  type OnApproveDataOneTimePayments,
  type OnCompleteData,
  type OnCancelDataOneTimePayments,
  type OnErrorData,
  PayPalSubscriptionButton
} from "@paypal/react-paypal-js/sdk-v6";
import BaseCheckout from "../../pages/BaseCheckout";
import type { ModalType, ModalContent } from "../../types";
import { createSubscription } from "../../utils";

/**
 * Checkout page for subscription payments.
 *
 * Uses useEligibleMethods to check payment method eligibility for recurring payments.
 */
const Checkout = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const { loadingStatus } = usePayPal();
  const navigate = useNavigate();

  // Fetch eligibility for recurring/subscription payment flow
  const { error: eligibilityError } = useEligibleMethods({
    payload: {
      currencyCode: "USD",
      paymentFlow: "RECURRING_PAYMENT",
    },
  });

  const isLoading = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

  const handleSubscriptionCallbacks = {
    onApprove: async (data: OnApproveDataOneTimePayments) => {
      console.log("Subscription approved:", data);
      console.log("Payer ID:", data.payerId);
      setModalState("success");
    },

    onCancel: (data: OnCancelDataOneTimePayments) => {
      console.log("Subscription cancelled:", data);
      setModalState("cancel");
    },

    onError: (error: OnErrorData) => {
      console.error("Subscription error:", error);
      setModalState("error");
    },

    onComplete: (data: OnCompleteData) => {
      console.log("Subscription session completed");
      console.log("On Complete data:", data);
    },
  };

  const getModalContent = useCallback(
    (state: ModalType): ModalContent | null => {
      switch (state) {
        case "success":
          return {
            title: "Subscription Created! 🎉",
            message: "Your subscription has been successfully set up!",
          };
        case "cancel":
          return {
            title: "Subscription Cancelled",
            message: "Your subscription setup was cancelled.",
          };
        case "error":
          return {
            title: "Subscription Error",
            message:
              "There was an error setting up your subscription. Please try again.",
          };
        default:
          return null;
      }
    },
    [],
  );

  const handleModalClose = () => {
    setModalState(null);
    if (modalState === "success") {
      navigate("/");
    }
  };

  const paymentButtons = isLoading ? (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      Loading payment methods...
    </div>
  ) : eligibilityError ? (
    <div style={{ padding: "1rem", textAlign: "center", color: "red" }}>
      Failed to load payment options. Please refresh the page.
    </div>
  ) : (
    <PayPalSubscriptionButton
      createSubscription={createSubscription}
      presentationMode="auto"
      {...handleSubscriptionCallbacks}
    />
  );

  return (
    <BaseCheckout
      flowType="subscription"
      modalState={modalState}
      onModalClose={handleModalClose}
      getModalContent={getModalContent}
      paymentButtons={paymentButtons}
    />
  );
};

export default Checkout;
