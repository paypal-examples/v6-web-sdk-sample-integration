import React, { useContext, useEffect } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import { setupPayPalButton } from "./utils";

const PayPalButton: React.FC = () => {
  const { isReady, sdkInstance, paymentMethodEligibility } =
    useContext(PayPalSDKContext);

  useEffect(() => {
    if (isReady && paymentMethodEligibility.isPayPalEligible) {
      setupPayPalButton(sdkInstance);
    }
  }, [isReady, paymentMethodEligibility.isPayPalEligible, sdkInstance]);


  return <paypal-button hidden type="pay" id="paypal-button"></paypal-button>;
};

export default PayPalButton;
