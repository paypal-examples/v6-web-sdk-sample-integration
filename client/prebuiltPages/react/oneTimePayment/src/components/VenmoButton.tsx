import React from "react";
import { useVenmoOneTimePaymentSession } from "@paypal/react-paypal-js/sdk-v6";
import { createOrder } from "../utils";
import type { PaymentSessionOptions } from "../types/paypal";

const VenmoButton: React.FC<PaymentSessionOptions> = (props) => {
  const { handleClick } = useVenmoOneTimePaymentSession({
    presentationMode: "auto",
    createOrder,
    ...props,
  } as never);

  return (
    <venmo-button
      onClick={() => handleClick()}
      type="pay"
      id="venmo-button"
    ></venmo-button>
  );
};

export default VenmoButton;
