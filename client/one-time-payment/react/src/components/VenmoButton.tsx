import React, { useContext } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import { createOrder } from "./utils";

const VenmoButton: React.FC = () => {
  const { isReady, paymentMethodEligibility, venmoSession } =
    useContext(PayPalSDKContext);
  const venmoOnClickHandler = async () => {
      try {
        await venmoSession.start(
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

  if (isReady && !paymentMethodEligibility.isVenmoEligible) {
    return <p>VENMO NOT ELIGIBLE</p>;
  }

  return (
    <venmo-button
      onClick={() => venmoOnClickHandler()}
      type="pay"
      id="venmo-button"
    ></venmo-button>
  );
};

export default VenmoButton;
