import React from "react";
import {
  useVenmoOneTimePaymentSession,
  type UseVenmoOneTimePaymentSessionProps,
} from "@paypal/react-paypal-js/sdk-v6";

const VenmoButton: React.FC<UseVenmoOneTimePaymentSessionProps> = (props) => {
  const { handleClick } = useVenmoOneTimePaymentSession(props);

  return (
    <venmo-button
      onClick={() => handleClick()}
      type="pay"
      id="venmo-button"
    ></venmo-button>
  );
};

export default VenmoButton;
