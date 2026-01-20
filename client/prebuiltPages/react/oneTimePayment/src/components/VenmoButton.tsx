import React from "react";
import {
  useVenmoOneTimePaymentSession,
  type VenmoOneTimePaymentSessionOptions,
} from "@paypal/react-paypal-js/sdk-v6";
import { createOrder } from "../utils";

const VenmoButton: React.FC<
  Omit<VenmoOneTimePaymentSessionOptions, "orderId" | "createOrder">
> = (props) => {
  const { handleClick } = useVenmoOneTimePaymentSession({
    presentationMode: "auto",
    createOrder,
    ...props,
  });

  return (
    <venmo-button
      onClick={() => handleClick()}
      type="pay"
      id="venmo-button"
    ></venmo-button>
  );
};

export default VenmoButton;
