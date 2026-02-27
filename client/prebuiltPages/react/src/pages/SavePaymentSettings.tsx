import { useState, useCallback } from "react";
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
import PaymentModal from "../components/PaymentModal";
import type { ModalType, ModalContent } from "../types";
import { createVaultToken } from "../utils";

const SavePaymentSettings = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const { loadingStatus } = usePayPal();

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
            title: "Payment Method Saved!",
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
  };

  const modalContent = modalState ? getModalContent(modalState) : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#1a1a2e",
            marginBottom: "24px",
          }}
        >
          Account Settings
        </h1>

        {/* Account Information */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1a1a2e",
              marginTop: 0,
              marginBottom: "16px",
            }}
          >
            Account Information
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#0070ba",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: "600",
                flexShrink: 0,
              }}
            >
              JC
            </div>
            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#1a1a2e",
                }}
              >
                Jane Cooper
              </div>
              <div style={{ fontSize: "14px", color: "#4a5568" }}>
                jane.cooper@example.com
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1a1a2e",
              marginTop: 0,
              marginBottom: "16px",
            }}
          >
            Payment Methods
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#718096",
              marginBottom: "24px",
            }}
          >
            No payment methods saved yet.
          </p>

          <h3
            style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "#1a1a2e",
              marginBottom: "16px",
            }}
          >
            Add a Payment Method
          </h3>

          {isLoading ? (
            <div style={{ padding: "1rem", textAlign: "center" }}>
              Loading payment methods...
            </div>
          ) : eligibilityError ? (
            <div style={{ padding: "1rem", textAlign: "center", color: "red" }}>
              Failed to load payment options. Please refresh the page.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
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
            </div>
          )}
        </div>
      </div>

      {modalContent && (
        <PaymentModal content={modalContent} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default SavePaymentSettings;
