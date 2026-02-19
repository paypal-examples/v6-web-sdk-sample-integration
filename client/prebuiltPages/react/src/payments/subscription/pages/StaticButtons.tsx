import { useState, useCallback } from "react";
import {
  usePayPal,
  useEligibleMethods,
  INSTANCE_LOADING_STATE,
  type OnApproveDataOneTimePayments,
  type OnCompleteData,
  type OnCancelDataOneTimePayments,
  type OnErrorData,
} from "@paypal/react-paypal-js/sdk-v6";
import PayPalSubscriptionButton from "../components/PayPalSubscriptionButton";
import BaseStaticButtons from "../../../pages/BaseStaticButtons";
import type { ModalType, ModalContent } from "../../../types";
import { createSubscription } from "../../../utils";

/**
 * Static buttons demo for subscription payments.
 *
 * Uses useEligibleMethods to check payment method eligibility for recurring payments.
 */
const StaticButtons = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const { loadingStatus } = usePayPal();

  // Fetch eligibility for recurring/subscription payment flow
  const { isLoading: isEligibilityLoading, error: eligibilityError } =
    useEligibleMethods({
      payload: {
        currencyCode: "USD",
        paymentFlow: "RECURRING_PAYMENT",
      },
    });

  const isSDKLoading = loadingStatus === INSTANCE_LOADING_STATE.PENDING;
  const isReady = !isSDKLoading && !isEligibilityLoading;

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

  const renderPaymentButtons = () => {
    if (!isReady) {
      return (
        <div style={{ padding: "1rem", textAlign: "center" }}>
          Loading payment methods...
        </div>
      );
    }

    if (eligibilityError) {
      return (
        <div style={{ padding: "1rem", textAlign: "center", color: "red" }}>
          Failed to load payment options. Please refresh the page.
        </div>
      );
    }

    return (
      <PayPalSubscriptionButton
        createSubscription={createSubscription}
        presentationMode="auto"
        {...handleSubscriptionCallbacks}
      />
    );
  };

  return (
    <BaseStaticButtons
      paymentButtons={renderPaymentButtons}
      getModalContent={getModalContent}
      modalState={modalState}
      onModalClose={() => setModalState(null)}
    />
  );
};

export default StaticButtons;
