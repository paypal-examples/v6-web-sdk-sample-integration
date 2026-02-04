import { useState, useCallback } from "react";
import {
  type OnApproveDataOneTimePayments,
  type OnCompleteData,
} from "@paypal/react-paypal-js/sdk-v6";
import PayPalSubscriptionButton from "../components/PayPalSubscriptionButton";
import BaseStaticButtons from "../../../pages/BaseStaticButtons";
import type { ModalType, ModalContent } from "../../../types";
import { createSubscription } from "../utils";

const StaticButtons = () => {
  const [modalState, setModalState] = useState<ModalType>(null);

  const handleSubscriptionCallbacks = {
    onApprove: async (data: OnApproveDataOneTimePayments) => {
      console.log("Subscription approved:", data);
      console.log("Payer ID:", data.payerId);
      setModalState("success");
    },

    onCancel: () => {
      console.log("Subscription cancelled");
      setModalState("cancel");
    },

    onError: (error: Error) => {
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
