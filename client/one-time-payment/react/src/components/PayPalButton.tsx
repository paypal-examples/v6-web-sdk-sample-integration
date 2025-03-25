import React, { useContext } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import { createOrder } from "./utils";

const PayPalButton: React.FC = () => {
  const { isReady, paymentMethodEligibility, paypalSession } =
    useContext(PayPalSDKContext);
  const payPalOnClickHandler = async () => {
    try {
      await paypalSession.start(
        { presentationMode: "auto" },
        createOrder()
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (!isReady) {
    return <p>LOADING.....</p>;
  }

  if (isReady && !paymentMethodEligibility.isPayPalEligible) {
    return <p>PAYPAL NOT ELIGIBLE</p>;
  }

  return (
    <paypal-button
      onClick={() => payPalOnClickHandler()}
      type="pay"
      id="paypal-button"
    ></paypal-button>
  );
};

export default PayPalButton;
