import React from "react";
import {
  usePayLaterOneTimePaymentSession,
  type UsePayLaterOneTimePaymentSessionProps,
  usePayPal,
} from "@paypal/react-paypal-js/sdk-v6";

const PayLaterButton: React.FC<UsePayLaterOneTimePaymentSessionProps> = (
  props,
) => {
  const { handleClick } = usePayLaterOneTimePaymentSession(props);

  const { eligiblePaymentMethods } = usePayPal();
  const payLaterDetails = eligiblePaymentMethods?.getDetails?.("paylater");
  const countryCode = payLaterDetails?.countryCode;
  const productCode = payLaterDetails?.productCode;

  return (
    <paypal-pay-later-button
      onClick={() => handleClick()}
      countryCode={countryCode}
      productCode={productCode}
      id="paylater-button"
    ></paypal-pay-later-button>
  );
};

export default PayLaterButton;
