import React from "react";

import { createOrder } from "../utils";
// import { useErrorBoundary } from "react-error-boundary";
import {
  usePayPalOneTimePaymentSession,
} from "@paypal/react-paypal-js/sdk-v6";
import type { PayPalOneTimePaymentSessionOptions, UsePayPalOneTimePaymentSessionProps } from "@paypal/react-paypal-js/sdk-v6";

const PayPalButton: React.FC<UsePayPalOneTimePaymentSessionProps> = (
  paymentSessionOptions,
) => {
  const { handleClick } = usePayPalOneTimePaymentSession(paymentSessionOptions);

  return (
    <paypal-button
      onClick={handleClick}
      type="pay"
      id="paypal-button"
    ></paypal-button>
  );
};

export const PayPalButton2: React.FC<PayPalOneTimePaymentSessionOptions> = (paymentSessionOptions) => {
  const { onApprove, onCancel, onError, onComplete } = paymentSessionOptions;
  // const orderId = "some-order-id"; // This would typically be generated dynamically
  const { handleClick } = usePayPalOneTimePaymentSession({
    presentationMode: "modal",
    createOrder,
    // orderId,
    onApprove,
    onComplete,
    onCancel,
    onError,
  });

  return (
    <paypal-button
      onClick={handleClick}
      type="pay"
      id="paypal-button"
    ></paypal-button>
  );
};

export default PayPalButton;
