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
  // TODO: Remove this type assertion once @paypal/react-paypal-js@9.0.0-alpha.4+ properly exports
  // EligiblePaymentMethodsOutput and types eligiblePaymentMethods correctly after hydration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payLaterDetails = (eligiblePaymentMethods as unknown as any)
    ?.getDetails?.("paylater");
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
