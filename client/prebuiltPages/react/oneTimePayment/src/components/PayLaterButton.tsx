import React from "react";

import { createOrder } from "../utils";
import { usePayLaterOneTimePaymentSession } from "@paypal/react-paypal-js/sdk-v6";
import type {
  PayLaterCountryCodes,
  PayLaterOneTimePaymentSessionOptions,
  PayLaterProductCodes,
} from "@paypal/react-paypal-js/sdk-v6";

// TODO is there a better way to not duplicate these props?
// TODO how are we going to pass in eligibility?
interface PayLaterButtonProps extends PayLaterOneTimePaymentSessionOptions {
  countryCode: PayLaterCountryCodes;
  productCode: PayLaterProductCodes;
}

const PayLaterButton: React.FC<PayLaterButtonProps> = (
  {
    countryCode,
    productCode,
    ...paymentSessionOptions
  },
) => {
  const { error, handleClick } = usePayLaterOneTimePaymentSession({
    presentationMode: "auto",
    onApprove: async () => console.log("Pay Later payment approved"),
    createOrder,
  })

  return (
    <paypal-pay-later-button
      countryCode={countryCode}
      id="paypal-button"
      onClick={handleClick}
      productCode={productCode}
      type="pay"
    ></paypal-pay-later-button>
  );
};

export default PayLaterButton;
