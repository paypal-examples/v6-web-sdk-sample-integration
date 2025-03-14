import React, { useEffect, useState } from "react";
import { initVenmoButton } from "./utils";

const VenmoButton: React.FC = () => {
  const [isEligible, setIsEligible] = useState<boolean>(false);
  // in useEffect
  // load the script and initialize the button
  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        if (!window.paypal) {
          const script = document.createElement("script");
          script.src = "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = () => initVenmoButton(setIsEligible);
          document.body.appendChild(script);
        } else {
          await initVenmoButton(setIsEligible);
        }
      } catch (e) {
        console.error("Failed to load PayPal SDK - Venmo Button", e);
      }
    };

    loadPayPalSDK();
  }, []);

  return (
    isEligible && <venmo-button type="pay" id="venmo-button"></venmo-button>
  );
};

export default VenmoButton;