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

  const payCreditDetails = eligiblePaymentMethods?.getDetails?.("credit");
  const countryCode = payCreditDetails?.countryCode;

  return (
    <paypal-credit-button
      id="paypal-credit-save-button"
      countryCode={countryCode}
      onClick={() => handleClick()}
    ></paypal-credit-button>
  );
};

export default PayPalCreditSaveButton;
