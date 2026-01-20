import React from "react";
import {
  usePayPalOneTimePaymentSession,
  type PayPalOneTimePaymentSessionOptions,
} from "@paypal/react-paypal-js/sdk-v6";
import { createOrder } from "../utils";

const PayPalButton: React.FC<
  Omit<PayPalOneTimePaymentSessionOptions, "orderId" | "createOrder">
> = (props) => {
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
