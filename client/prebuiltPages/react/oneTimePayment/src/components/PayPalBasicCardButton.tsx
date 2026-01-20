import React from "react";
import {
  usePayPalGuestPaymentSession,
  type UsePayPalGuestPaymentSessionProps,
} from "@paypal/react-paypal-js/sdk-v6";

const PayPalBasicCardButton: React.FC<UsePayPalGuestPaymentSessionProps> = (props) => {
  const { handleClick } = usePayPalGuestPaymentSession(props);

  return (
    <paypal-basic-card-container>
      <paypal-basic-card-button
        onClick={() => handleClick()}
        id="paypal-basic-card-button"
      ></paypal-basic-card-button>
    </paypal-basic-card-container>
  );
};

export default PayPalBasicCardButton;
