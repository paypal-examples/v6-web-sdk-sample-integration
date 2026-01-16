import React from "react";
import { usePayPalGuestPaymentSession } from "@paypal/react-paypal-js/sdk-v6";
import { createOrder } from "../utils";
import type { PaymentSessionOptions } from "../types/paypal";

const PayPalBasicCardButton: React.FC<PaymentSessionOptions> = (props) => {
  const { handleClick } = usePayPalGuestPaymentSession({
    presentationMode: "auto",
    createOrder,
    ...props,
  } as never);

  return (
    <paypal-basic-card-container>
      <paypal-basic-card-button
        onClick={() => handleClick()}
        type="pay"
        id="paypal-basic-card-button"
      ></paypal-basic-card-button>
    </paypal-basic-card-container>
  );
};

export default PayPalBasicCardButton;
