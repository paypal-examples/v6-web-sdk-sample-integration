import React from "react";
import {
  usePayPalGuestPaymentSession,
  type PayPalGuestOneTimePaymentSessionOptions,
} from "@paypal/react-paypal-js/sdk-v6";
import { createOrder } from "../utils";

const PayPalBasicCardButton: React.FC<
  Omit<PayPalGuestOneTimePaymentSessionOptions, "orderId" | "createOrder">
> = (props) => {
  const { handleClick } = usePayPalGuestPaymentSession({
    presentationMode: "auto",
    createOrder,
    ...props,
  } as never);

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
