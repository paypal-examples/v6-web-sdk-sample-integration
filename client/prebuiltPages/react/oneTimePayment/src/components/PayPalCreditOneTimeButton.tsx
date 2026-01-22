import React from "react";
import {
  usePayPalCreditOneTimePaymentSession,
  type UsePayPalCreditOneTimePaymentSessionProps,
  usePayPal,
} from "@paypal/react-paypal-js/sdk-v6";

const PayPalCreditOneTimeButton: React.FC<
  UsePayPalCreditOneTimePaymentSessionProps
> = (props) => {
  const { handleClick } = usePayPalCreditOneTimePaymentSession(props);
  const { eligiblePaymentMethods } = usePayPal();

  // Check if credit is eligible first
  if (!eligiblePaymentMethods?.isEligible?.("credit")) {
    return null;
  }

  const paypalCreditDetails = eligiblePaymentMethods?.getDetails?.("credit");
  const countryCode = paypalCreditDetails?.countryCode;

  if (!countryCode) {
    return null;
  }

  return (
    <paypal-credit-button
      id="paypal-credit-onetime-button"
      countryCode={countryCode}
      onClick={() => handleClick()}
    ></paypal-credit-button>
  );
};

export default PayPalCreditOneTimeButton;
