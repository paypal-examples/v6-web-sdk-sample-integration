import React, { useContext } from "react";
import { PayPalSDKContext } from "../context/sdkContext";

const VenmoButton: React.FC = () => {
  const { isReady } = useContext(PayPalSDKContext);
  return isReady ? (
    <venmo-button hidden type="pay" id="venmo-button"></venmo-button>
  ) : <p>loading...</p>;
};

export default VenmoButton;
