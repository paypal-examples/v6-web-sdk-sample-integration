import React from "react";
import {
  usePayLaterOneTimePaymentSession,
  usePayPal,
} from "@paypal/react-paypal-js/sdk-v6";
import { createOrder } from "../utils";
import type { PaymentSessionOptions } from "../types/paypal";

const PayLaterButton: React.FC<PaymentSessionOptions> = (props) => {
  const { handleClick } = usePayLaterOneTimePaymentSession({
    presentationMode: "auto",
    createOrder,
    ...props,
  } as never);

  const { eligiblePaymentMethods } = usePayPal();
  const payLaterDetails = eligiblePaymentMethods?.getDetails?.("paylater");
  const countryCode = payLaterDetails?.countryCode;
  const productCode = payLaterDetails?.productCode;

  return (
    <paypal-pay-later-button
      onClick={() => handleClick()}
      countryCode={countryCode}
      productCode={productCode}
      type="pay"
      id="paylater-button"
    ></paypal-pay-later-button>
  );
};

export default PayLaterButton;
