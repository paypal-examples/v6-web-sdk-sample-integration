import React, { useRef, useEffect, useMemo } from "react";

import { createOrder } from "../utils";
import { useErrorBoundary } from "react-error-boundary";
import { usePayPalInstance } from "@paypal/react-paypal-js/sdk-v6";
import type {
  PayPalOneTimePaymentSessionOptions,
  OneTimePaymentSession,
} from "@paypal/react-paypal-js/sdk-v6";

const PayPalButton: React.FC<PayPalOneTimePaymentSessionOptions> = (
  paymentSessionOptions,
) => {
  const { sdkInstance } = usePayPalInstance();
  const { showBoundary } = useErrorBoundary();
  const paypalSession = useRef<OneTimePaymentSession>(null);

  // Memoize the payment session options to prevent unnecessary re-creation
  const memoizedOptions = useMemo(
    () => paymentSessionOptions,
    [
      // Add specific dependencies here based on what properties of paymentSessionOptions should trigger re-creation
      // For example: paymentSessionOptions.amount, paymentSessionOptions.currency, etc.
      JSON.stringify(paymentSessionOptions),
    ],
  );

  useEffect(() => {
    if (sdkInstance) {
      paypalSession.current = sdkInstance.createPayPalOneTimePaymentSession(
        memoizedOptions,
      );
    }
  }, [sdkInstance, memoizedOptions]);

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
