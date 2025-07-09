import React, { useContext, useCallback } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import { captureOrder, createOrder } from "../utils";
import {
  OnApproveData,
  PaymentSessionOptions,
} from "../types/paypal";
import { useErrorBoundary } from "react-error-boundary";
import { useCreatePayPalOneTimePaymentSession } from "../hooks/useCreatePayPalOneTimePaymentSession";

const PayPalButton: React.FC<PaymentSessionOptions> = () => {
  const { sdkInstance } = useContext(PayPalSDKContext);
  const { showBoundary } = useErrorBoundary();

  const paypalCheckoutSession = useCreatePayPalOneTimePaymentSession({
    sdkInstance,
    onApprove: useCallback(async (data: OnApproveData) => {
      console.log("Payment approved:", data);
      const captureResult = await captureOrder({ orderId: data.orderId });
      console.log("Payment capture result:", captureResult);
      // setModalState("success");
    }, []),

    onCancel: useCallback(() => {
      console.log("Payment cancelled");
      // setModalState("cancel");
    }, []),

    onError: useCallback((error: Error) => {
      console.error("Payment error:", error);
      // setModalState("error");
    }, []),
  });

  const payPalOnClickHandler = async () => {
    if (!paypalCheckoutSession) return;

    try {
      await paypalCheckoutSession.start(
        { presentationMode: "auto" },
        createOrder()
      );
    } catch (e) {
      console.error(e);
      showBoundary(e);
    }
  };

  return (
    <paypal-button
      onClick={() => payPalOnClickHandler()}
      type="pay"
      id="paypal-button"
    ></paypal-button>
  );
};

export default PayPalButton;
