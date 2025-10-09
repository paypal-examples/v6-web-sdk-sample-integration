import React, { useRef, useEffect } from "react";

import { createOrder } from "../utils";
import { useErrorBoundary } from "react-error-boundary";
import { usePayPal } from "@paypal/react-paypal-js/sdk-v6";
import type {
  OneTimePaymentSession,
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
  const { sdkInstance } = usePayPal();
  const { showBoundary } = useErrorBoundary();
  const payLaterSession = useRef<OneTimePaymentSession>(null);

  useEffect(() => {
    if (sdkInstance) {
      payLaterSession.current = sdkInstance.createPayLaterOneTimePaymentSession(
        paymentSessionOptions,
      );
    }
  }, [sdkInstance, paymentSessionOptions]);

  const payPalOnClickHandler = async () => {
    if (!payLaterSession.current) return;

    try {
      await payLaterSession.current.start(
        { presentationMode: "auto" },
        createOrder(),
      );
    } catch (e) {
      console.error(e);
      showBoundary(e);
    }
  };

  return (
    <paypal-pay-later-button
      countryCode={countryCode}
      id="paypal-button"
      onClick={() => payPalOnClickHandler()}
      productCode={productCode}
      type="pay"
    ></paypal-pay-later-button>
  );
};

export default PayLaterButton;
