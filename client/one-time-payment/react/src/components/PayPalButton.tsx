import React, { useEffect, useState } from "react";
import { initSdkInstance, setupPayPalButton } from "./utils";

const PayPalButton: React.FC = () => {
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [sdkInstance, setSdkInstance] = useState<any>();

  useEffect(() => {
    const initializeButton = async () => {
      if (window.paypal) {
        const instance = await initSdkInstance(setIsEligible, "paypal");
        setSdkInstance(instance);
      }
    };
    initializeButton();
  }, []);

  useEffect(() => {
    if (isEligible && sdkInstance) {
      setupPayPalButton(sdkInstance)
    }
  }, [isEligible, sdkInstance]);

  return (
    isEligible && <paypal-button type="pay" id="paypal-button"></paypal-button>
  );
};

export default PayPalButton;
