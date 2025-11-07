import React, { useContext, useEffect, useRef } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import { createOrder } from "../utils";
import { PaymentSessionOptions, SessionOutput } from "../types/paypal";
import { useErrorBoundary } from "react-error-boundary";

const VenmoButton: React.FC<PaymentSessionOptions> = (
  paymentSessionOptions,
) => {
  const { sdkInstance } = useContext(PayPalSDKContext);
  const { showBoundary } = useErrorBoundary();
  const venmoSession = useRef<SessionOutput>(null);

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
      // get the promise reference by invoking createOrder()
      // do not await this async function since it can cause transient activation issues
      const createOrderPromise = createOrder();
      await venmoSession.current.start(
        { presentationMode: "auto" },
        createOrderPromise,
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
