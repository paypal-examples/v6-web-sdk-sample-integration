import {
  useVenmoOneTimePaymentSession,
  type UseVenmoOneTimePaymentSessionProps,
} from "@paypal/react-paypal-js/sdk-v6";

const VenmoButton = (props: UseVenmoOneTimePaymentSessionProps) => {
  const { handleClick } = useVenmoOneTimePaymentSession(props);

  return (
    <venmo-button
      onClick={() => handleClick()}
      type="pay"
      id="venmo-button"
    ></venmo-button>
  );
};

export default VenmoButton;
