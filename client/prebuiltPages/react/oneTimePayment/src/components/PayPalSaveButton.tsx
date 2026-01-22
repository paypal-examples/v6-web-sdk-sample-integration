import React from "react";
import {
  usePayPalSavePaymentSession,
  type UsePayPalSavePaymentSessionProps,
} from "@paypal/react-paypal-js/sdk-v6";

const PayPalSaveButton: React.FC<UsePayPalSavePaymentSessionProps> = (
  props,
) => {
  const { handleClick, error } = usePayPalSavePaymentSession(props);

  if (error) {
    console.error("PayPalSaveButton hook error:", error);
    return null;
  }

  return (
    <paypal-button
      id="paypal-save-button"
      onClick={() => handleClick()}
    ></paypal-button>
  );
};

export default PayPalSaveButton;
