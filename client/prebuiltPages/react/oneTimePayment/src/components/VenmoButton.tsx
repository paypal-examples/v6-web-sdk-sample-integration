import React, { useContext, useEffect, useRef } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import { createOrder } from "../utils";
import { PaymentSessionOptions, SessionOutput } from "../types/paypal";
import { useErrorBoundary } from "react-error-boundary";

/**
 * VenmoButton component renders a Venmo button and manages the Venmo payment session.
 *
 * @param {PaymentSessionOptions} paymentSessionOptions - The options for the Venmo payment session, including event handlers.
 * @returns {JSX.Element} The rendered Venmo button component.
 */
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

  /**
   * Handles the Venmo button click event, starts the payment session,
   * and triggers error boundaries on failure.
   */
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
