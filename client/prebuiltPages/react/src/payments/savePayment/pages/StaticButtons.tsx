import { useState, useCallback } from "react";
import {
  type OnApproveDataSavePayments,
  type OnCompleteData,
} from "@paypal/react-paypal-js/sdk-v6";
import PayPalSaveButton from "../components/PayPalSaveButton";
import PayPalCreditSaveButton from "../components/PayPalCreditSaveButton";
import BaseStaticButtons from "../../../pages/BaseStaticButtons";
import type { ModalType, ModalContent } from "../../../types";
import { createVaultToken } from "../utils";

const StaticButtons = () => {
  const [modalState, setModalState] = useState<ModalType>(null);

  const handleSaveCallbacks = {
    onApprove: async (data: OnApproveDataSavePayments) => {
      console.log("Payment method saved:", data);
      console.log("Vault Setup Token:", data.vaultSetupToken);
      setModalState("success");
    },

    onCancel: () => {
      console.log("Save payment method cancelled");
      setModalState("cancel");
    },

    onError: (error: Error) => {
      console.error("Save payment method error:", error);
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
            title: "Payment Method Saved! 🎉",
            message:
              "Your payment method has been securely saved for future use.",
          };
        case "cancel":
          return {
            title: "Save Cancelled",
            message: "Saving your payment method was cancelled.",
          };
        case "error":
          return {
            title: "Save Error",
            message:
              "There was an error saving your payment method. Please try again.",
          };
        default:
          return null;
      }
    },
    [],
  );

  const renderPaymentButtons = () => {
    return (
      <>
        <div>
          <PayPalSaveButton
            createVaultToken={createVaultToken}
            presentationMode="auto"
            {...handleSaveCallbacks}
          />
        </div>

        <div>
          <PayPalCreditSaveButton
            createVaultToken={createVaultToken}
            presentationMode="auto"
            {...handleSaveCallbacks}
          />
        </div>
      </>
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
