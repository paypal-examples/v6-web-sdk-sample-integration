import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  usePayPal,
  INSTANCE_LOADING_STATE,
  type OnApproveDataOneTimePayments,
  type OnErrorData,
  type OnCompleteData,
  type OnCancelDataOneTimePayments,
} from "@paypal/react-paypal-js/sdk-v6";
import PayPalButton from "../components/PayPalButton";
import VenmoButton from "../components/VenmoButton";
import PayLaterButton from "../components/PayLaterButton";
import PayPalBasicCardButton from "../components/PayPalBasicCardButton";
import PayPalCreditOneTimeButton from "../components/PayPalCreditOneTimeButton";
import BaseCheckout from "../../../pages/BaseCheckout";
import type { ModalType, ModalContent, ProductItem } from "../../../types";
import { captureOrder, createOrder } from "../../../utils";

const Checkout = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const { loadingStatus } = usePayPal();
  const navigate = useNavigate();

  const handleCreateOrder = async () => {
    const savedCart = sessionStorage.getItem("cart");
    const products: ProductItem[] = savedCart ? JSON.parse(savedCart) : [];

    const cart = products.map((product) => ({
      sku: product.sku,
      quantity: product.quantity,
    }));

    return await createOrder(cart);
  };

  const handlePaymentCallbacks = {
    onApprove: async (data: OnApproveDataOneTimePayments) => {
      console.log("Payment approved:", data);
      const captureResult = await captureOrder({ orderId: data.orderId });
      console.log("Payment capture result:", captureResult);

      sessionStorage.removeItem("cart");
      setModalState("success");
    },

    onCancel: (data: OnCancelDataOneTimePayments) => {
      console.log("Payment cancelled:", data);
      setModalState("cancel");
    },

    onError: (error: OnErrorData) => {
      console.error("Payment error:", error);
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

  const isSDKLoading =
    loadingStatus === INSTANCE_LOADING_STATE.PENDING

  const handleModalClose = () => {
    setModalState(null);
    if (modalState === "success") {
      navigate("/");
    }
  };

  const paymentButtons = isSDKLoading ? (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      Loading payment methods...
    </div>
  ) : (
    <>
      <PayPalButton
        createOrder={handleCreateOrder}
        presentationMode="auto"
        {...handlePaymentCallbacks}
      />

      <VenmoButton
        createOrder={handleCreateOrder}
        presentationMode="auto"
        {...handlePaymentCallbacks}
      />

      <PayLaterButton
        createOrder={handleCreateOrder}
        presentationMode="auto"
        {...handlePaymentCallbacks}
      />

      <PayPalBasicCardButton
        createOrder={handleCreateOrder}
        {...handlePaymentCallbacks}
      />

      <PayPalCreditOneTimeButton
        createOrder={handleCreateOrder}
        presentationMode="auto"
        {...handlePaymentCallbacks}
      />
    </>
  );

  return (
    <BaseCheckout
      flowType="one-time-payment"
      modalState={modalState}
      onModalClose={handleModalClose}
      getModalContent={getModalContent}
      paymentButtons={paymentButtons}
    />
  );
};

export default Checkout;
