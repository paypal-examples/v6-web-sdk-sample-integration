import React from "react";

import { createSetupToken } from "../utils";
// import { useErrorBoundary } from "react-error-boundary";
import { usePayPalSavePaymentSession } from "@paypal/react-paypal-js/sdk-v6";
import type { SavePaymentSessionOptions } from "@paypal/react-paypal-js/sdk-v6";

export const PayPalSavePaymentButton: React.FC<SavePaymentSessionOptions> = (
  paymentSessionOptions,
) => {
  const { onApprove, onCancel, onError } = paymentSessionOptions;

  const { handleClick } = usePayPalSavePaymentSession({
    presentationMode: "auto",
    createVaultToken: createSetupToken,
    onApprove,
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

export default PayPalSavePaymentButton;
