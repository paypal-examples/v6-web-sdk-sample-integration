import React from "react";
import {
  usePayPalSavePaymentSession,
  type UsePayPalSavePaymentSessionProps,
} from "@paypal/react-paypal-js/sdk-v6";

const PayPalSaveButton: React.FC<UsePayPalSavePaymentSessionProps> = (
  props,
) => {
  const { handleClick } = usePayPalSavePaymentSession(props);

  return (
    <paypal-button
      id="paypal-save-button"
      type="pay"
      onClick={() => handleClick()}
    ></paypal-button>
  );
};

export default PayPalSaveButton;
