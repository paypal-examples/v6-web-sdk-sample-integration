import React from "react";
import {
  usePayPalOneTimePaymentSession,
  type UsePayPalOneTimePaymentSessionProps,
} from "@paypal/react-paypal-js/sdk-v6";

const PayPalButton: React.FC<UsePayPalOneTimePaymentSessionProps> = (props) => {
  const { handleClick } = usePayPalOneTimePaymentSession(props);

  return (
    <paypal-button
      onClick={() => handleClick()}
      type="pay"
      id="paypal-button"
    ></paypal-button>
  );
};

export default PayPalButton;
