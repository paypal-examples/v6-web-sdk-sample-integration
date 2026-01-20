import React from "react";
import {
  usePayLaterOneTimePaymentSession,
  usePayPal,
  type PayLaterOneTimePaymentSessionOptions,
} from "@paypal/react-paypal-js/sdk-v6";
import { createOrder } from "../utils";

const PayLaterButton: React.FC<
  Omit<PayLaterOneTimePaymentSessionOptions, "orderId" | "createOrder">
> = (props) => {
  const { handleClick } = usePayLaterOneTimePaymentSession({
    presentationMode: "auto",
    createOrder,
    ...props,
  });

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
