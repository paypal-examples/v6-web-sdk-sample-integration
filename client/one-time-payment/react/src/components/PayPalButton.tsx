import React, { useContext } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import { createOrder } from "../utils";
import { PaymentSessionOptions } from "../types/paypal";
import { useErrorBoundary } from "react-error-boundary";

const PayPalButton: React.FC<PaymentSessionOptions> = (paymentSessionOptions) => {
  const { sdkInstance } = useContext(PayPalSDKContext);
  const { showBoundary } = useErrorBoundary();

  const paypalSession = sdkInstance!.createPayPalOneTimePaymentSession(paymentSessionOptions);

  const payPalOnClickHandler = async () => {
    try {
      await paypalSession.start(
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
