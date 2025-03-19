import React, { useContext, useEffect, useRef, useState } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import { paymentSessionOptions, createOrder } from "./utils";

const PayPalButton: React.FC = () => {
  const { isReady, sdkInstance, paymentMethodEligibility } =
    useContext(PayPalSDKContext);
  const onClickRef = useRef(() => {});

  useEffect(() => {
    if (isReady && paymentMethodEligibility.isPayPalEligible) {
      const paypalSession = sdkInstance.createPayPalOneTimePaymentSession(
        paymentSessionOptions
      );
      onClickRef.current = async () => {
        try {
          await paypalSession.start(
            { presentationMode: "auto" },
            createOrder()
          );
        } catch (e) {
          console.error(e);
        }
      };
    }
  }, [isReady, paymentMethodEligibility.isPayPalEligible, sdkInstance]);

  if (!isReady) {
    return <p>LOADING.....</p>;
  }

  if (isReady && !paymentMethodEligibility.isPayPalEligible) {
    return <p>PAYPAL NOT ELIGIBLE</p>;
  }

  return (
    <paypal-button
      onClick={() => onClickRef.current()}
      type="pay"
      id="paypal-button"
    ></paypal-button>
  );
};

export default PayPalButton;
