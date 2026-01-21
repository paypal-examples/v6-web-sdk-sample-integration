import React, { useState, useCallback } from "react";
import PayPalButton from "../components/PayPalButton";
import VenmoButton from "../components/VenmoButton";
import ProductDisplay from "../components/ProductDisplay";
import PaymentModal from "../components/PaymentModal";

import soccerBallImage from "../static/images/world-cup.jpg";
import { captureOrder, createOrder } from "../utils";
import "../static/styles/SoccerBall.css";
import "../static/styles/Modal.css";
import {
  usePayPal,
  PayPalOneTimePaymentButton,
  VenmoOneTimePaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";
import type {
  OnApproveDataOneTimePayments,
  OnCancelDataOneTimePayments,
  OnCompleteData,
  SavePaymentSessionOptions,
} from "@paypal/react-paypal-js/sdk-v6";
import { PayPalSavePaymentButton } from "../components/PayPalSavePaymentButton";
import PayLaterButton from "../components/PayLaterButton";
// import GuestPaymentButton from "../components/GuestPaymentButton";
// import {
//   PayPalMessages,
//   ManualMessagingComponent,
//   PayPalMessagesLearnMore,
// } from "../components/PayPalMessages";
import PayPalCreditButton from "../components/PayPalCreditButton";

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
  const { eligiblePaymentMethods } = usePayPal();
  const [modalState, setModalState] = useState<ModalType>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const totalAmount = (PRODUCT.price * quantity).toFixed(2);

  // Payment handlers
  const handlePaymentCallbacks = {
    onApprove: async (data: OnApproveDataOneTimePayments) => {
      console.log("Payment approved:", data);
      const captureResult = await captureOrder({ orderId: data.orderId });
      console.log("Payment capture result:", captureResult);
      setModalState("success");
    },

    onCancel: (data: OnCancelDataOneTimePayments) => {
      console.log("Payment cancelled", data);
      setModalState("cancel");
    },

    onComplete: (data:OnCompleteData) => {
      console.log("On Complete Called");
      console.log("On Complete data:", data);
    },

    onError: (error: Error) => {
      console.error("Payment error:", error);
      setModalState("error");
    },
  };

  const handleSavePaymentCallbacks: SavePaymentSessionOptions = {
    onApprove: async (data) => {
      console.log("Payment approved:", data);
      // const captureResult = await captureOrder({ orderId: data.orderId });
      // console.log("Payment capture result:", captureResult);
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
  const isPayPalEligible = eligiblePaymentMethods?.isEligible("paypal")
  const isVenmoEligible = eligiblePaymentMethods?.isEligible("venmo");
  const isPayLaterEligible =
    eligiblePaymentMethods?.isEligible("paylater");

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

      <div className="quantity-selector">
        <label htmlFor="quantity-input">Quantity:</label>
        <input
          type="number"
          id="quantity-input"
          min="1"
          max="10"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
        />
        <p className="total-amount">Total: ${totalAmount}</p>
      </div>

      <div className="payment-options">
        {isPayPalEligible && <PayPalButton {...handlePaymentCallbacks} orderId={'created-elsewhere'} presentationMode="auto" />}
        {isPayPalEligible && <PayPalButton {...handlePaymentCallbacks} createOrder={createOrder} presentationMode="auto" />}
        {isPayLaterEligible && <PayLaterButton {...handlePaymentCallbacks} />}
        {isPayPalEligible && (
          <PayPalSavePaymentButton {...handleSavePaymentCallbacks} />
        )}
        {isVenmoEligible && <VenmoButton {...handlePaymentCallbacks} />}
        <PayPalCreditButton {...handlePaymentCallbacks} />
        {/* <GuestPaymentButton {...handlePaymentCallbacks} /> */}
        {/* <PayPalMessages amount={totalAmount} />
        <ManualMessagingComponent amount={totalAmount}/> */}
        {/* <PayPalMessagesLearnMore initialAmount={totalAmount} /> */}
        <PayPalOneTimePaymentButton
          createOrder={createOrder}
          onApprove={async (data: OnApproveDataOneTimePayments) => {
            console.log("Payment approved:", data);
            const captureResult = await captureOrder({ orderId: data.orderId });
            console.log("Payment capture result:", captureResult);
            setModalState("success");
          }}
          presentationMode="auto"
        />
        <VenmoOneTimePaymentButton
          createOrder={createOrder}
          onApprove={async (data: OnApproveDataOneTimePayments) => {
            console.log("Payment approved:", data);
            const captureResult = await captureOrder({ orderId: data.orderId });
            console.log("Payment capture result:", captureResult);
            setModalState("success");
          }}
          presentationMode="auto"
        />
      </div>
    </div>
  );
};

export default SoccerBall;
