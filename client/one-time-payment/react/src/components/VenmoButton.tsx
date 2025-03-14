import React, { useEffect, useState } from "react";
import { initSdkInstance, setupVenmoButton } from "./utils";

const VenmoButton: React.FC = () => {
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [sdkInstance, setSdkInstance] = useState<any>();

  useEffect(() => {
    const initializeButton = async () => {
      if (window.paypal) {
        const instance = await initSdkInstance(setIsEligible, "venmo");
        setSdkInstance(instance);
      }
    };
    initializeButton();
  }, []);

  useEffect(() => {
    if (isEligible && sdkInstance) {
      setupVenmoButton(sdkInstance)
    }
  }, [isEligible, sdkInstance]);

  return (
    isEligible && <venmo-button type="pay" id="venmo-button"></venmo-button>
  );
};

export default VenmoButton;
