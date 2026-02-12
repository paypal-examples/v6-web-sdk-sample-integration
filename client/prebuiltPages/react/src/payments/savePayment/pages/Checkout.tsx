import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  type OnApproveDataSavePayments,
  type OnCompleteData,
  type OnErrorData,
  type OnCancelDataSavePayments,
  PayPalSavePaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";
import PayPalCreditSaveButton from "../components/PayPalCreditSaveButton";
import BaseCheckout from "../../../pages/BaseCheckout";
import type { ModalType, ModalContent } from "../../../types";
import { createVaultToken } from "../../../utils";

const Checkout = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const navigate = useNavigate();

  const handleSaveCallbacks = {
    onApprove: async (data: OnApproveDataSavePayments) => {
      console.log("Payment method saved:", data);
      console.log("Vault Setup Token:", data.vaultSetupToken);
      setModalState("success");
    },

    onCancel: (data: OnCancelDataSavePayments) => {
      console.log("Save payment method cancelled:", data);
      setModalState("cancel");
    },

    onError: (error: OnErrorData) => {
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

  const handleModalClose = () => {
    setModalState(null);
    if (modalState === "success") {
      navigate("/");
    }
  };

  const paymentButtons = (
    <>
      <div>
        <PayPalSavePaymentButton
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

  return (
    <BaseCheckout
      flowType="save-payment"
      modalState={modalState}
      onModalClose={handleModalClose}
      getModalContent={getModalContent}
      paymentButtons={paymentButtons}
    />
  );
};

export default Checkout;
