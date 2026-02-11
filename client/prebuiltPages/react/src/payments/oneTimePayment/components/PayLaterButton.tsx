import { PayLaterOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6";
import type { ComponentProps } from "react";

type PayLaterButtonProps = ComponentProps<typeof PayLaterOneTimePaymentButton>;

const PayLaterButton = (props: PayLaterButtonProps) => {
  return <PayLaterOneTimePaymentButton {...props} />;
};

export default PayLaterButton;
