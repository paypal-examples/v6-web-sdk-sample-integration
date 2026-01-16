import React from "react";
import { usePayPalOneTimePaymentSession } from "@paypal/react-paypal-js/sdk-v6";
import { createOrder } from "../utils";
import type { PaymentSessionOptions } from "../types/paypal";

const PayPalButton: React.FC<PaymentSessionOptions> = (props) => {
  const { handleClick } = usePayPalOneTimePaymentSession({
    presentationMode: "auto",
    createOrder,
    ...props,
  } as never);

  return (
    <paypal-button
      onClick={() => handleClick()}
      type="pay"
      id="paypal-button"
    ></paypal-button>
  );
};

export default PayPalButton;
