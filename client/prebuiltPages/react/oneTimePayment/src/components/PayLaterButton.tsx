import React, { useContext, useRef, useEffect } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import { createOrder } from "../utils";
import { PaymentSessionOptions, SessionOutput } from "../types/paypal";
import { useErrorBoundary } from "react-error-boundary";

// TODO is there a better way to not duplicate these props?
// TODO how are we going to pass in eligibility?
interface PayLaterButtonProps extends PaymentSessionOptions {
  countryCode: string;
  productCode: string;
}

const PayLaterButton: React.FC<PayLaterButtonProps> = (
  {
    countryCode,
    productCode,
    ...paymentSessionOptions
  },
) => {
  const { sdkInstance } = useContext(PayPalSDKContext);
  const { showBoundary } = useErrorBoundary();
  const payLaterSession = useRef<SessionOutput>(null);

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
