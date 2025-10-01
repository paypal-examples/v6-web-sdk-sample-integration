import React, { useEffect, useMemo, useRef } from "react";
import { createOrder } from "../utils";
import { useErrorBoundary } from "react-error-boundary";
import { usePayPalInstance } from "@paypal/react-paypal-js/sdk-v6";
import type {
  VenmoPaymentSessionOptions,
  OneTimePaymentSession,
} from "@paypal/react-paypal-js/sdk-v6";

const VenmoButton: React.FC<VenmoPaymentSessionOptions> = (
  paymentSessionOptions,
) => {
  const { sdkInstance } = usePayPalInstance();
  const { showBoundary } = useErrorBoundary();
  const venmoSession = useRef<OneTimePaymentSession>(null);

  // Memoize the payment session options to prevent unnecessary re-creation
  const memoizedOptions = useMemo(
    () => paymentSessionOptions,
    [
      // Add specific dependencies here based on what properties of paymentSessionOptions should trigger re-creation
      JSON.stringify(paymentSessionOptions),
    ],
  );

  useEffect(() => {
    if (sdkInstance) {
      venmoSession.current = sdkInstance.createVenmoOneTimePaymentSession(
        memoizedOptions,
      );
    }
  }, [sdkInstance, memoizedOptions]);

  const venmoOnClickHandler = async () => {
    if (!venmoSession.current) return;

    try {
      await venmoSession.current.start(
        { presentationMode: "auto" },
        createOrder(),
      );
    } catch (e) {
      console.error(e);
      showBoundary(e);
    }
  };

  return (
    <venmo-button
      onClick={() => venmoOnClickHandler()}
      type="pay"
      id="venmo-button"
    ></venmo-button>
  );
};

export default VenmoButton;
