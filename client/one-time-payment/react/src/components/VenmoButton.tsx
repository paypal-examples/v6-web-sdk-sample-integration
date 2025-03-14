import React, { useEffect, useState } from "react";
import { initButton } from "./utils";

const VenmoButton: React.FC = () => {
  const [isEligible, setIsEligible] = useState<boolean>(false);

  useEffect(() => {
    if (window.paypal) {
      initButton(setIsEligible, "venmo");
    }
  }, []);

  return (
    isEligible && <venmo-button type="pay" id="venmo-button"></venmo-button>
  );
};

export default VenmoButton;
