import React, { useEffect, useMemo, useRef } from "react";
import { createOrder } from "../utils";
import { useErrorBoundary } from "react-error-boundary";
import { usePayPal } from "@paypal/react-paypal-js/sdk-v6";
import type {
  VenmoOneTimePaymentSession,
  VenmoOneTimePaymentSessionOptions,
} from "@paypal/react-paypal-js/sdk-v6";

const VenmoButton: React.FC<VenmoOneTimePaymentSessionOptions> = (
  paymentSessionOptions,
) => {
  const { sdkInstance } = usePayPal();
  const { showBoundary } = useErrorBoundary();
  const venmoSession = useRef<VenmoOneTimePaymentSession>(null);

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
      venmoSession.current =
        sdkInstance.createVenmoOneTimePaymentSession(memoizedOptions);
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
