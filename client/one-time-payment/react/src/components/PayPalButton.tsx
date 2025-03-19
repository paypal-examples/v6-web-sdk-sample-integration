import React, { useContext, useEffect, useRef } from "react";
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

      const paypalButton = document.getElementById("paypal-button");
      paypalButton?.removeAttribute("hidden");
    }
  }, [isReady, paymentMethodEligibility.isPayPalEligible, sdkInstance]);

  if (!isReady) {
    return <p>LOADING.....</p>
  }

  return (
    <paypal-button
      onClick={() => onClickRef.current()}
      hidden
      type="pay"
      id="paypal-button"
    ></paypal-button>
  );
};

export default PayPalButton;
