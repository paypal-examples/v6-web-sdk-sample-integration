import { useState, useCallback } from "react";
import {
  usePayPal,
  useEligibleMethods,
  INSTANCE_LOADING_STATE,
  type OnApproveDataSavePayments,
  type OnCompleteData,
  type OnCancelDataSavePayments,
  type OnErrorData,
  PayPalSavePaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";
import PayPalCreditSaveButton from "../components/PayPalCreditSaveButton";
import BaseStaticButtons from "../../../pages/BaseStaticButtons";
import type { ModalType, ModalContent } from "../../../types";
import { createVaultToken } from "../../../utils";

/**
 * Static buttons demo for saving payment methods (vaulting).
 *
 * Uses useEligibleMethods to check payment method eligibility for vaulting without payment.
 */
const StaticButtons = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const { loadingStatus } = usePayPal();

  // Fetch eligibility for vault without payment flow (save payment method only)
  const { isLoading: isEligibilityLoading, error: eligibilityError } =
    useEligibleMethods({
      payload: {
        currencyCode: "USD",
        paymentFlow: "VAULT_WITHOUT_PAYMENT",
      },
    });

  const isSDKLoading = loadingStatus === INSTANCE_LOADING_STATE.PENDING;
  const isReady = !isSDKLoading && !isEligibilityLoading;

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
