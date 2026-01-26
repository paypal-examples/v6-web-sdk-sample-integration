import {
  usePayPalGuestPaymentSession,
  type UsePayPalGuestPaymentSessionProps,
} from "@paypal/react-paypal-js/sdk-v6";

const PayPalBasicCardButton = (
  props: UsePayPalGuestPaymentSessionProps,
) => {
  const { handleClick } = usePayPalGuestPaymentSession(props);

  return (
    <paypal-basic-card-container>
      <paypal-basic-card-button
        onClick={() => handleClick()}
        id="paypal-basic-card-button"
      ></paypal-basic-card-button>
    </paypal-basic-card-container>
  );
};

export default PayPalBasicCardButton;
