import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  usePayPal,
  useEligibleMethods,
  INSTANCE_LOADING_STATE,
  type OnApproveDataSavePayments,
  type OnCompleteData,
  type OnErrorData,
  type OnCancelDataSavePayments,
  PayPalSavePaymentButton,
  PayPalCreditSavePaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";
import BaseCheckout from "../../pages/BaseCheckout";
import type { ModalType, ModalContent } from "../../types";
import { createVaultToken } from "../../utils";

/**
 * Checkout page for saving payment methods (vaulting).
 *
 * Uses useEligibleMethods to check payment method eligibility for vaulting without payment.
 */
const Checkout = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const { loadingStatus } = usePayPal();
  const navigate = useNavigate();

  // Fetch eligibility for vault without payment flow (save payment method only)
  const { error: eligibilityError } = useEligibleMethods({
    payload: {
      currencyCode: "USD",
      paymentFlow: "VAULT_WITHOUT_PAYMENT",
    },
  });

  const isLoading = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

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

  const paymentButtons = isLoading ? (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      Loading payment methods...
    </div>
  ) : eligibilityError ? (
    <div style={{ padding: "1rem", textAlign: "center", color: "red" }}>
      Failed to load payment options. Please refresh the page.
    </div>
  ) : (
    <>
      <div>
        <PayPalSavePaymentButton
          createVaultToken={createVaultToken}
          presentationMode="auto"
          {...handleSaveCallbacks}
        />
      </div>

      <div>
        <PayPalCreditSavePaymentButton
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
