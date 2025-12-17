import { usePayPalGuestPaymentSession } from "@paypal/react-paypal-js/sdk-v6";
import { createOrder } from "../utils";
import type { PayPalGuestOneTimePaymentSessionOptions } from "@paypal/react-paypal-js/sdk-v6";


const GuestPaymentButton: React.FC<PayPalGuestOneTimePaymentSessionOptions> = (paymentSessionOptions) => {
  const { onApprove, onCancel, onError, onComplete } = paymentSessionOptions;
  const { handleClick, buttonRef } = usePayPalGuestPaymentSession({
    createOrder,
    onApprove,
    onComplete,
    // onCancel: () => {
    //   handleCancel();
    //   onCancel?.();
    // },
    onCancel,
    onError,
    // targetElement: "#paypal-basic-card-button",
  });

  return (
    <paypal-basic-card-container>
      <paypal-basic-card-button
        ref={buttonRef}
        onClick={handleClick}
        // type="pay"
        buyerCountry="US"
        id="paypal-basic-card-button"
      ></paypal-basic-card-button>
    </paypal-basic-card-container>
  );
};

export default GuestPaymentButton;