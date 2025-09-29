import React, { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (sdkInstance) {
      venmoSession.current = sdkInstance.createVenmoOneTimePaymentSession(
        paymentSessionOptions,
      );
    }
  }, [sdkInstance, paymentSessionOptions]);

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
