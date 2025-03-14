import React, { useEffect, useState } from "react";
import { initPayPalButton } from "./utils";

const PayPalButton: React.FC = () => {
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
          script.onload = () => initPayPalButton(setIsEligible);
          document.body.appendChild(script);
        } else {
          await initPayPalButton(setIsEligible);
        }
      } catch (e) {
        console.error("Failed to load PayPal SDK - PayPal Button", e);
      }
    };

    loadPayPalSDK();
  }, []);

  return (
    isEligible && <paypal-button type="pay" id="paypal-button"></paypal-button>
  );
};

export default PayPalButton;
