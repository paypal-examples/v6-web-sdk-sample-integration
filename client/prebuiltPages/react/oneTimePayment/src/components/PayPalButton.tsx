import React, { useContext, useRef, useEffect } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import { createOrder } from "../utils";
import { PaymentSessionOptions, SessionOutput } from "../types/paypal";
import { useErrorBoundary } from "react-error-boundary";

const PayPalButton: React.FC<PaymentSessionOptions> = (
  paymentSessionOptions,
) => {
  const { sdkInstance } = useContext(PayPalSDKContext);
  const { showBoundary } = useErrorBoundary();
  const paypalSession = useRef<SessionOutput>(null);

  useEffect(() => {
    if (sdkInstance && !paypalSession.current) {
      paypalSession.current = sdkInstance.createPayPalOneTimePaymentSession(
        paymentSessionOptions,
      );
    }

    return () => {
      if (paypalSession.current && typeof paypalSession.current.destroy === 'function') {
        paypalSession.current.destroy();
        paypalSession.current = null;
      }
    };
  }, [sdkInstance]);

  const payPalOnClickHandler = async () => {
    if (!paypalSession.current) return;

    try {
      await paypalSession.current.start(
        { presentationMode: "auto" },
        createOrder(),
      );
    } catch (e) {
      console.error(e);
      showBoundary(e);
    }
  };

  return (
    <paypal-button
      onClick={() => payPalOnClickHandler()}
      type="pay"
      id="paypal-button"
    ></paypal-button>
  );
};

export default PayPalButton;
