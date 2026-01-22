import React from "react";
import {
  usePayPalCreditSavePaymentSession,
  type UsePayPalCreditSavePaymentSessionProps,
  usePayPal,
} from "@paypal/react-paypal-js/sdk-v6";

const PayPalCreditSaveButton: React.FC<
  UsePayPalCreditSavePaymentSessionProps
> = (props) => {
  const { handleClick } = usePayPalCreditSavePaymentSession(props);
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
      id="paypal-credit-save-button"
      countryCode={countryCode}
      onClick={() => handleClick()}
    ></paypal-credit-button>
  );
};

export default PayPalCreditSaveButton;
