import { useState, useCallback } from "react";
import {
  usePayPal,
  INSTANCE_LOADING_STATE,
  type OnApproveDataOneTimePayments,
  type OnCompleteData,
  type OnErrorData,
  type OnCancelDataOneTimePayments,
  PayPalOneTimePaymentButton,
  VenmoOneTimePaymentButton,
  PayLaterOneTimePaymentButton,
  PayPalGuestPaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";
import BaseStaticButtons from "../../../pages/BaseStaticButtons";
import type { ModalType, ModalContent, ProductItem } from "../../../types";
import { captureOrder, createOrder } from "../../../utils";

const StaticButtons = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const { loadingStatus, eligiblePaymentMethods } = usePayPal();

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

    onError: (data: OnErrorData) => {
      console.error("Payment error:", data);
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
    loadingStatus === INSTANCE_LOADING_STATE.PENDING || !eligiblePaymentMethods;

  const handleCreateOrder = useCallback(async (products: ProductItem[]) => {
    const cart = products
      .filter((product) => product.quantity > 0)
      .map((product) => ({
        sku: product.sku,
        quantity: product.quantity,
      }));

    return await createOrder(cart);
  }, []);

  const renderPaymentButtons = (products: ProductItem[]) => {
    if (isSDKLoading) {
      return (
        <div style={{ padding: "1rem", textAlign: "center" }}>
          Loading payment methods...
        </div>
      );
    }

    return (
      <>
        <PayPalOneTimePaymentButton
          createOrder={() => handleCreateOrder(products)}
          presentationMode="auto"
          {...handlePaymentCallbacks}
        />

        <VenmoOneTimePaymentButton
          createOrder={() => handleCreateOrder(products)}
          presentationMode="auto"
          {...handlePaymentCallbacks}
        />

        <PayLaterOneTimePaymentButton
          createOrder={() => handleCreateOrder(products)}
          presentationMode="auto"
          {...handlePaymentCallbacks}
        />

        <PayPalGuestPaymentButton
          createOrder={() => handleCreateOrder(products)}
          {...handlePaymentCallbacks}
        />
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
