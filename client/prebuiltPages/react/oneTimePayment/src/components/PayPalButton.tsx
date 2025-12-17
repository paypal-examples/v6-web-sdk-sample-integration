import React from "react";

import { createOrder } from "../utils";
// import { useErrorBoundary } from "react-error-boundary";
import {
  usePayPalOneTimePaymentSession,
} from "@paypal/react-paypal-js/sdk-v6";
import type { PayPalOneTimePaymentSessionOptions } from "@paypal/react-paypal-js/sdk-v6";

const PayPalButton: React.FC<PayPalOneTimePaymentSessionOptions> = (
  paymentSessionOptions,
) => {
  const { onApprove, onCancel, onError, onComplete } = paymentSessionOptions;
  const { handleClick } = usePayPalOneTimePaymentSession({
    presentationMode: "modal",
    createOrder,
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
