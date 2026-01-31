import { useEffect } from "react";
import {
  usePayPalOneTimePaymentSession,
  type UsePayPalOneTimePaymentSessionProps,
} from "@paypal/react-paypal-js/sdk-v6";
import { useErrorBoundary } from "react-error-boundary";

const PayPalDirectAppSwitchButton = (props: UsePayPalOneTimePaymentSessionProps) => {
  const { handleClick, error } = usePayPalOneTimePaymentSession(props);
  const { showBoundary } = useErrorBoundary();

  useEffect(() => {
    if (error) {
      showBoundary(error);
    }
  }, [error, showBoundary]);

  return (
    <paypal-button
      onClick={() => handleClick()}
      type="pay"
      id="paypal-button"
    ></paypal-button>
  );
};

export default PayPalDirectAppSwitchButton;
