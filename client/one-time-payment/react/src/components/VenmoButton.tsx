import React, { useContext, useEffect } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import { setupVenmoButton } from "./utils";

const VenmoButton: React.FC = () => {
  const { isReady, sdkInstance, paymentMethodEligibility } =
    useContext(PayPalSDKContext);

  useEffect(() => {
    if (isReady && paymentMethodEligibility.isVenmoEligible) {
      setupVenmoButton(sdkInstance);
    }
  }, [isReady, paymentMethodEligibility.isVenmoEligible, sdkInstance]);
  
  return <venmo-button hidden type="pay" id="venmo-button"></venmo-button>;
};

export default VenmoButton;
