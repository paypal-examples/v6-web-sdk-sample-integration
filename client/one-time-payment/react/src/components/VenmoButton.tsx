import React, { useContext, useEffect, useRef } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import { createOrder, paymentSessionOptions } from "./utils";

const VenmoButton: React.FC = () => {
  const { isReady, sdkInstance, paymentMethodEligibility } =
    useContext(PayPalSDKContext);
  const onClickRef = useRef(() => {});

  useEffect(() => {
    if (isReady && paymentMethodEligibility.isVenmoEligible) {
      const venmoSession = sdkInstance.createVenmoOneTimePaymentSession(
        paymentSessionOptions
      );
      onClickRef.current = async () => {
        try {
          await venmoSession.start({ presentationMode: "auto" }, createOrder());
        } catch (e) {
          console.error(e);
        }
      };
    }
  }, [isReady, paymentMethodEligibility.isVenmoEligible, sdkInstance]);

  if (!isReady) {
    return <p>LOADING.....</p>;
  }

  if (isReady && !paymentMethodEligibility.isVenmoEligible) {
    return <p>VENMO NOT ELIGIBLE</p>;
  }

  return (
    <venmo-button
      onClick={() => onClickRef.current()}
      type="pay"
      id="venmo-button"
    ></venmo-button>
  );
};

export default VenmoButton;
