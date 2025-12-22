import React from "react";

import { createOrder } from "../utils";
import {
  usePayPalCreditOneTimePaymentSession,
} from "@paypal/react-paypal-js/sdk-v6";
import type { PayPalOneTimePaymentSessionOptions } from "@paypal/react-paypal-js/sdk-v6";

const PayPalCreditButton: React.FC<PayPalOneTimePaymentSessionOptions> = (
  paymentSessionOptions,
) => {
  const { onApprove, onCancel, onError, onComplete } = paymentSessionOptions;
  const { handleClick } = usePayPalCreditOneTimePaymentSession({
    presentationMode: "modal",
    createOrder,
    onApprove,
    onComplete,
    onCancel,
    onError,
  });

  return (
    <paypal-credit-button countryCode="US" onClick={handleClick}></paypal-credit-button>
  );
};

export default PayPalCreditButton;
