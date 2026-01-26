import {
  usePayPalSavePaymentSession,
  type UsePayPalSavePaymentSessionProps,
} from "@paypal/react-paypal-js/sdk-v6";

const PayPalSaveButton = (props: UsePayPalSavePaymentSessionProps) => {
  const { handleClick } = usePayPalSavePaymentSession(props);

  return (
    <paypal-button
      id="paypal-save-button"
      type="pay"
      onClick={() => handleClick()}
    ></paypal-button>
  );
};

export default PayPalSaveButton;
