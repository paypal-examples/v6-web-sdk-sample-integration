import React, { useContext } from "react";
import { PayPalSDKContext } from "../context/sdkContext";

const PayPalButton: React.FC = () => {
  const { isReady } = useContext(PayPalSDKContext);
  return isReady ? (
    <paypal-button hidden type="pay" id="paypal-button"></paypal-button>
  ) : <p>loading...</p>;
};

export default PayPalButton;
