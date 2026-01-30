import { useState, useCallback } from "react";
import {
  usePayPal,
  INSTANCE_LOADING_STATE,
  type OnApproveDataOneTimePayments,
  type OnApproveDataSavePayments,
  type OnCompleteData,
} from "@paypal/react-paypal-js/sdk-v6";
import PayPalButton from "../components/PayPalButton";
import VenmoButton from "../components/VenmoButton";
import PayLaterButton from "../components/PayLaterButton";
import PayPalBasicCardButton from "../components/PayPalBasicCardButton";
import PayPalSubscriptionButton from "../components/PayPalSubscriptionButton";
import PayPalSaveButton from "../components/PayPalSaveButton";
import PayPalCreditOneTimeButton from "../components/PayPalCreditOneTimeButton";
import PayPalCreditSaveButton from "../components/PayPalCreditSaveButton";
import ProductDisplay from "../components/ProductDisplay";
import PaymentModal from "../components/PaymentModal";

import soccerBallImage from "../static/images/world-cup.jpg";
import {
  captureOrder,
  createOrder,
  createSubscription,
  createVaultToken,
} from "../utils";
import "../static/styles/SoccerBall.css";
import "../static/styles/Modal.css";
import PayPalDirectAppSwitchButton from "../components/PayPalDirectAppSwitchButton";

// Types
type ModalType = "success" | "cancel" | "error" | null;

interface ModalContent {
  title: string;
  message: string;
}

// Constants
const PRODUCT = {
  name: "World Cup Ball",
  icon: "⚽️",
  price: 100.0,
  imageSrc: soccerBallImage,
  imageAlt: "Official World Cup Soccer Ball",
} as const;

const SoccerBall = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const { loadingStatus, eligiblePaymentMethods } = usePayPal();

  const handlePaymentCallbacks = {
    onApprove: async (data: OnApproveDataOneTimePayments) => {
      console.log("Payment approved:", data);
      const captureResult = await captureOrder({ orderId: data.orderId });
      console.log("Payment capture result:", captureResult);
      setModalState("success");
    },

    onCancel: () => {
      console.log("Payment cancelled");
      setModalState("cancel");
    },

    onError: (error: Error) => {
      console.error("Payment error:", error);
      setModalState("error");
    },

    onComplete: (data: OnCompleteData) => {
      console.log("Payment session completed");
      console.log("On Complete data:", data);
    },
  };

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
  };

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

  const modalContent = getModalContent(modalState);

  // Check if SDK is still loading OR eligibility hasn't been fetched yet
  // This ensures all buttons (including PayLater which needs eligibility data) appear together
  const isSDKLoading =
    loadingStatus === INSTANCE_LOADING_STATE.PENDING || !eligiblePaymentMethods;

  return (
    <div className="soccer-ball-container" data-testid="soccer-ball-container">
      {modalContent && (
        <PaymentModal
          content={modalContent}
          onClose={() => setModalState(null)}
        />
      )}

      <ProductDisplay product={PRODUCT} />

      <div className="payment-options">
        {isSDKLoading ? (
          <div style={{ padding: "1rem", textAlign: "center" }}>
            Loading payment methods...
          </div>
        ) : (
          <>
            {/* <PayPalButton
              createOrder={createOrder}
              presentationMode="auto"
              {...handlePaymentCallbacks}
            />

            <VenmoButton
              createOrder={createOrder}
              presentationMode="auto"
              {...handlePaymentCallbacks}
            />

            <PayLaterButton
              createOrder={createOrder}
              presentationMode="auto"
              {...handlePaymentCallbacks}
            />

            <PayPalBasicCardButton
              createOrder={createOrder}
              {...handlePaymentCallbacks}
            />

            <PayPalSubscriptionButton
              createSubscription={createSubscription}
              presentationMode="auto"
              {...handleSubscriptionCallbacks}
            />

            <PayPalSaveButton
              createVaultToken={createVaultToken}
              presentationMode="auto"
              {...handleSaveCallbacks}
            />

            <PayPalCreditOneTimeButton
              createOrder={createOrder}
              presentationMode="auto"
              {...handlePaymentCallbacks}
            />

            <PayPalCreditSaveButton
              createVaultToken={createVaultToken}
              presentationMode="auto"
              {...handleSaveCallbacks}
            /> */}
            <PayPalDirectAppSwitchButton
              createOrder={createOrder}
              presentationMode="direct-app-switch"
              {...handlePaymentCallbacks}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SoccerBall;
