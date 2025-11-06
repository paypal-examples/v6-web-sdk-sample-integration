import React from "react";
import { createOrder } from "../utils";
import { useVenmoOneTimePaymentSession } from "@paypal/react-paypal-js/sdk-v6";
import type {
  VenmoOneTimePaymentSessionOptions,
} from "@paypal/react-paypal-js/sdk-v6";

const VenmoButton: React.FC<VenmoOneTimePaymentSessionOptions> = (
  paymentSessionOptions,
) => {
  const { onApprove, onCancel, onError } = paymentSessionOptions;
  
    const { handleClick } = useVenmoOneTimePaymentSession({
      presentationMode: "popup",
      createOrder,
      onApprove,
      onCancel,
      onError,
    });

  return (
    <venmo-button
      onClick={handleClick}
      type="pay"
      id="venmo-button"
    ></venmo-button>
  );
};

export default VenmoButton;
