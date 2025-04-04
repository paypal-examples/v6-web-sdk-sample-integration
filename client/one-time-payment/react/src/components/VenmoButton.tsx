import React, { useContext } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import { createOrder } from "../utils";
import {PaymentSessionOptions} from "../types/paypal";
import { useErrorBoundary } from "react-error-boundary";

const VenmoButton: React.FC<PaymentSessionOptions> = (paymentSessionOptions) => {
  const { sdkInstance } = useContext(PayPalSDKContext);
  const venmoSession = sdkInstance!.createVenmoOneTimePaymentSession(paymentSessionOptions);
  const { showBoundary } = useErrorBoundary();

  const venmoOnClickHandler = async () => {
      try {
        await venmoSession?.start(
          { presentationMode: "auto" },
          createOrder()
        );
      } catch (e) {
        console.error(e);
        showBoundary(e);
      }
    };

  return (
    <venmo-button
      onClick={() => venmoOnClickHandler()}
      type="pay"
      id="venmo-button"
    ></venmo-button>
  );
};

export default VenmoButton;
