import React from "react";

import { createOrder } from "../utils";
// import { useErrorBoundary } from "react-error-boundary";
import { usePayLaterOneTimePaymentSession } from "@paypal/react-paypal-js/sdk-v6";
import type { PayLaterOneTimePaymentSessionOptions } from "@paypal/react-paypal-js/sdk-v6";

const PayLaterButton: React.FC<PayLaterOneTimePaymentSessionOptions> = (
  paymentSessionOptions,
) => {
  const { onApprove, onCancel, onError } = paymentSessionOptions;

  const { handleClick } = usePayLaterOneTimePaymentSession({
    presentationMode: "modal",
    createOrder,
    onApprove,
    onCancel,
    onError,
  });

  return (
    <paypal-pay-later-button
      onClick={handleClick}
      id="pay-later-auto-button"
      countryCode="US"
      productCode="PAYLATER"
      className="paypal-blue"
    ></paypal-pay-later-button>
  );
};

export default PayLaterButton;
