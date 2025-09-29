import React, { useState, useCallback } from "react";
import PayPalButton from "../components/PayPalButton";
import VenmoButton from "../components/VenmoButton";
import ProductDisplay from "../components/ProductDisplay";
import PaymentModal from "../components/PaymentModal";

import soccerBallImage from "../static/images/world-cup.jpg";
import { captureOrder } from "../utils";
import "../static/styles/SoccerBall.css";
import "../static/styles/Modal.css";
import { usePayPalInstance } from "@paypal/react-paypal-js/sdk-v6";
import type {
  OnApproveDataOneTimePayments,
  PayPalOneTimePaymentSessionOptions,
} from "@paypal/react-paypal-js/sdk-v6";

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

const SoccerBall: React.FC = () => {
  const { sdkInstance, eligiblePaymentMethods } = usePayPalInstance();
  const [modalState, setModalState] = useState<ModalType>(null);
  console.log(sdkInstance, eligiblePaymentMethods);
  // Payment handlers
  const handlePaymentCallbacks: PayPalOneTimePaymentSessionOptions = {
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

  // Check payment method eligibility
  const isPayPalEligible =
    sdkInstance && eligiblePaymentMethods?.isEligible("paypal");
  const isVenmoEligible =
    sdkInstance && eligiblePaymentMethods?.isEligible("venmo");

  const modalContent = getModalContent(modalState);
  console.log(isPayPalEligible);
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
        {isPayPalEligible && <PayPalButton {...handlePaymentCallbacks} />}

        {isVenmoEligible && <VenmoButton {...handlePaymentCallbacks} />}
      </div>
    </div>
  );
};

export default SoccerBall;
