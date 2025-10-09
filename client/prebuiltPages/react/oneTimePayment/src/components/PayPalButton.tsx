import React from "react";

import { createOrder } from "../utils";
import { useErrorBoundary } from "react-error-boundary";
import { usePayPalOneTimePaymentSession } from "@paypal/react-paypal-js/sdk-v6";
import type {
  PayPalOneTimePaymentSessionOptions,
} from "@paypal/react-paypal-js/sdk-v6";

const PayPalButton: React.FC<PayPalOneTimePaymentSessionOptions> = (
  paymentSessionOptions,
) => {
  const { showBoundary } = useErrorBoundary();
  const paypalSession = usePayPalOneTimePaymentSession(paymentSessionOptions)
console.log(paypalSession)
  const payPalOnClickHandler = async () => {
    if (!paypalSession) return;

    try {
      await paypalSession.start(
        { presentationMode: "auto" },
        createOrder(),
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
