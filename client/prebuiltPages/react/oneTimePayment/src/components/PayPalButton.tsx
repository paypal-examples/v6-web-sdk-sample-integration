import React, { useContext, useRef, useEffect } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import { createOrder } from "../utils";
import { PaymentSessionOptions, SessionOutput } from "../types/paypal";
import { useErrorBoundary } from "react-error-boundary";

/**
 * PayPalButton component renders a PayPal button and manages the PayPal payment session.
 *
 * @param {PaymentSessionOptions} paymentSessionOptions - The options for the PayPal payment session, including event handlers.
 * @returns {JSX.Element} The rendered PayPal button component.
 */
const PayPalButton: React.FC<PaymentSessionOptions> = (
  paymentSessionOptions,
) => {
  const { sdkInstance } = useContext(PayPalSDKContext);
  const { showBoundary } = useErrorBoundary();
  const paypalSession = useRef<SessionOutput>(null);

  useEffect(() => {
    if (sdkInstance) {
      paypalSession.current = sdkInstance.createPayPalOneTimePaymentSession(
        paymentSessionOptions,
      );
    }
  }, [sdkInstance, paymentSessionOptions]);

  /**
   * Handles the PayPal button click event, starts the payment session,
   * and triggers error boundaries on failure.
   */
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
