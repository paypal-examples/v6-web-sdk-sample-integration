import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  usePayPal,
  useEligibleMethods,
  INSTANCE_LOADING_STATE,
  PayPalCardFieldsProvider,
} from "@paypal/react-paypal-js/sdk-v6";
import type { ModalType, ModalContent } from "../types";
import PayPalCardFieldsOneTimePayment from "../payments/oneTimePayment/components/PayPalCardFieldsOneTimePayment";
import BaseCardFieldsCheckout from "../pages/BaseCardFieldsCheckout";

/**
 * Checkout page for one-time payments using card fields.
 *
 * Uses useEligibleMethods to check payment method eligibility for card fields one-time payments.
 */
const CardFieldsOneTimePaymentCheckout = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const { loadingStatus } = usePayPal();
  const navigate = useNavigate();

  // Fetch eligibility for one-time payment flow
  const { error: eligibilityError, eligiblePaymentMethods } =
    useEligibleMethods({
      payload: {
        currencyCode: "USD",
        paymentFlow: "ONE_TIME_PAYMENT",
      },
    });

  const isEligibilityResolved = !!eligiblePaymentMethods || !!eligibilityError;
  const isCardFieldsEligible =
    eligiblePaymentMethods?.isEligible("advanced_cards");

  const getModalContent = useCallback(
    (state: ModalType): ModalContent | null => {
      switch (state) {
        case "success":
          return {
            title: "Payment Successful! 🎉",
            message: "Thank you for your purchase!",
          };
        case "error":
          return {
            title: "Payment Error",
            message:
              "There was an error processing your payment. Please try again.",
          };
        default:
          return null;
      }
    },
    [],
  );

  const isLoading = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

  const handleModalClose = () => {
    setModalState(null);
    if (modalState === "success") {
      navigate("/");
    }
  };

  const payPalCardFieldsOneTimePayment =
    isLoading || !isEligibilityResolved ? (
      <div style={{ padding: "1rem", textAlign: "center" }}>
        Loading card fields...
      </div>
    ) : eligibilityError || !isCardFieldsEligible ? (
      <div style={{ padding: "1rem", textAlign: "center", color: "red" }}>
        Failed to load card fields. Please refresh the page.
      </div>
    ) : (
      <>
        <PayPalCardFieldsProvider>
          <PayPalCardFieldsOneTimePayment setModalState={setModalState} />
        </PayPalCardFieldsProvider>
      </>
    );

  return (
    <BaseCardFieldsCheckout
      flowType="one-time-payment"
      modalState={modalState}
      onModalClose={handleModalClose}
      getModalContent={getModalContent}
      cardFieldComponents={payPalCardFieldsOneTimePayment}
    />
  );
};

export default CardFieldsOneTimePaymentCheckout;
