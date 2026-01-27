import {
  usePayPalSubscriptionPaymentSession,
  type UsePayPalSubscriptionPaymentSessionProps,
} from "@paypal/react-paypal-js/sdk-v6";

const PayPalSubscriptionButton = (
  props: UsePayPalSubscriptionPaymentSessionProps,
) => {
  const { handleClick } = usePayPalSubscriptionPaymentSession(props);

  return (
    <paypal-button
      onClick={() => handleClick()}
      type="subscribe"
      id="paypal-subscription-button"
    ></paypal-button>
  );
};

export default PayPalSubscriptionButton;
