import React, { useEffect, useState } from "react";
import { initButton } from "./utils";

const PayPalButton: React.FC = () => {
  const [isEligible, setIsEligible] = useState<boolean>(false);

  useEffect(() => {
    if (window.paypal) {
      initButton(setIsEligible, "paypal");
    }
  }, []);

  return (
    isEligible && <paypal-button type="pay" id="paypal-button"></paypal-button>
  );
};

export default PayPalButton;
