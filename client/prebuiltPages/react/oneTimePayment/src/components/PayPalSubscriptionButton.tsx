import { FC } from "react";

import { createSubscription } from "../utils";
// import {useErrorBoundary} from 'react-error-boundary';
import { usePayPalSubscriptionPaymentSession } from "@paypal/react-paypal-js/sdk-v6";
import type { PayPalSubscriptionSessionOptions } from "@paypal/react-paypal-js/sdk-v6";

const PayPalSubscriptionButton: FC<PayPalSubscriptionSessionOptions> = (
  subscriptionSessionOptions,
) => {
  const { onApprove, onCancel, onError } = subscriptionSessionOptions;

  const { handleClick } = usePayPalSubscriptionPaymentSession({
    presentationMode: "auto",
    createSubscription,
    onApprove,
    onCancel,
    onError,
  });

  return (
    <paypal-button
      type="pay"
      onClick={handleClick}
      id="paypal-subscription-button"
      className="paypal-blue"
    ></paypal-button>
  );
};

export default PayPalSubscriptionButton;
