import React, { useContext, useState, useCallback } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import PayPalButton from "../components/PayPalButton";
import VenmoButton from "../components/VenmoButton";
import { PaymentSessionOptions, OnApproveData } from "../types/paypal";
import ProductDisplay from "../components/ProductDisplay";
import PaymentModal from "../components/PaymentModal";

import soccerBallImage from "../static/images/world-cup.jpg";
import { captureOrder } from "../utils";
import "../static/styles/SoccerBall.css";
import "../static/styles/Modal.css";

/**
 * ModalType defines the possible modal states for payment feedback.
 */
type ModalType = "success" | "cancel" | "error" | null;

/**
 * ModalContent describes the content displayed in the modal dialog.
 */
interface ModalContent {
  /** The modal title text. */
  title: string;
  /** The modal message text. */
  message: string;
}

/**
 * Product details for the World Cup Ball.
 */
const PRODUCT = {
  name: "World Cup Ball",
  icon: "⚽️",
  price: 100.0,
  imageSrc: soccerBallImage,
  imageAlt: "Official World Cup Soccer Ball",
} as const;

/**
 * SoccerBall section component displays the product, handles PayPal and Venmo payments,
 * and shows a modal dialog for payment status feedback.
 *
 * @returns {JSX.Element} The rendered SoccerBall section.
 */
const SoccerBall: React.FC = () => {
  const { sdkInstance, eligiblePaymentMethods } = useContext(PayPalSDKContext);
  const [modalState, setModalState] = useState<ModalType>(null);

  /**
   * Payment session event handlers for PayPal and Venmo buttons.
   */
  const handlePaymentCallbacks: PaymentSessionOptions = {
    /**
     * Called when the payment is approved.
     * @param {OnApproveData} data - The approval data.
     */
    onApprove: async (data: OnApproveData) => {
      console.log("Payment approved:", data);
      const captureResult = await captureOrder({ orderId: data.orderId });
      console.log("Payment capture result:", captureResult);
      setModalState("success");
    },

    /**
     * Called when the payment is cancelled.
     */
    onCancel: () => {
      console.log("Payment cancelled");
      setModalState("cancel");
    },

    /**
     * Called when an error occurs during payment.
     * @param {Error} error - The error object.
     */
    onError: (error: Error) => {
      console.error("Payment error:", error);
      setModalState("error");
    },
  };

  /**
   * Returns the modal content based on the current modal state.
   *
   * @param {ModalType} state - The current modal state.
   * @returns {ModalContent | null} The content to display in the modal.
   */
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
