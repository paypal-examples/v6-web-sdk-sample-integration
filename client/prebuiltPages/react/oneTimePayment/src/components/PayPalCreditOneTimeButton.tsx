import {
  usePayPalCreditOneTimePaymentSession,
  type UsePayPalCreditOneTimePaymentSessionProps,
  usePayPal,
} from "@paypal/react-paypal-js/sdk-v6";

const PayPalCreditOneTimeButton = (
  props: UsePayPalCreditOneTimePaymentSessionProps,
) => {
  const { handleClick } = usePayPalCreditOneTimePaymentSession(props);
  const { eligiblePaymentMethods } = usePayPal();

  const payCreditDetails = eligiblePaymentMethods?.getDetails?.("credit");
  const countryCode = payCreditDetails?.countryCode;

  return (
    <paypal-credit-button
      id="paypal-credit-onetime-button"
      countryCode={countryCode}
      onClick={() => handleClick()}
    ></paypal-credit-button>
  );
};

export default PayPalCreditOneTimeButton;
