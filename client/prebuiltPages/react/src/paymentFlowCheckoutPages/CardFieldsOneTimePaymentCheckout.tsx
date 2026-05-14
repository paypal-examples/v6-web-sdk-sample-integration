import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  usePayPal,
  useEligibleMethods,
  INSTANCE_LOADING_STATE,
  PayPalCardFieldsProvider,
} from "@paypal/react-paypal-js/sdk-v6";
import type { EventPayload, FieldState } from "@paypal/react-paypal-js/sdk-v6";
import type { ModalType, ModalContent } from "../types";
import PayPalCardFieldsOneTimePayment from "../payments/oneTimePayment/components/PayPalCardFieldsOneTimePayment";
import BaseCardFieldsCheckout from "../pages/BaseCardFieldsCheckout";

type CardFieldName = "number" | "cvv" | "expiry";
export type FieldsState = Record<CardFieldName, FieldState>;
export type TouchedFields = Record<CardFieldName, boolean>;

const INITIAL_FIELD: FieldState = {
  isEmpty: true,
  isValid: false,
  isPotentiallyValid: true,
  isFocused: false,
};

const INITIAL_FIELDS_STATE: FieldsState = {
  number: INITIAL_FIELD,
  cvv: INITIAL_FIELD,
  expiry: INITIAL_FIELD,
};

const INITIAL_TOUCHED: TouchedFields = {
  number: false,
  cvv: false,
  expiry: false,
};

/**
 * Checkout page for one-time payments using card fields.
 *
 * Uses useEligibleMethods to check payment method eligibility for card fields one-time payments.
 */
const CardFieldsOneTimePaymentCheckout = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const [fieldsState, setFieldsState] =
    useState<FieldsState>(INITIAL_FIELDS_STATE);
  const [touchedFields, setTouchedFields] =
    useState<TouchedFields>(INITIAL_TOUCHED);
  const { loadingStatus } = usePayPal();
  const navigate = useNavigate();

  const handleChange = useCallback((event: EventPayload) => {
    const { number, cvv, expiry } = event.data;
    console.log("[PayPal Card Fields] change event:", {
      emittedBy: event.data.emittedBy,
      fields: { number, cvv, expiry },
    });
    setFieldsState({ number, cvv, expiry });
  }, []);

  const handleBlur = useCallback((event: EventPayload) => {
    const field = event.data.emittedBy;
    console.log(`[PayPal Card Fields] blur: ${field}`, event.data[field]);
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true,
    }));
  }, []);

  const setAllTouched = useCallback(() => {
    setTouchedFields({ number: true, cvv: true, expiry: true });
  }, []);

  // Fetch eligibility for one-time payment flow
  const {
    error: eligibilityError,
    eligiblePaymentMethods,
    isLoading: isEligibilityLoading,
  } = useEligibleMethods({
    payload: {
      currencyCode: "USD",
      paymentFlow: "ONE_TIME_PAYMENT",
    },
  });

  const isCardFieldsEligible =
    !isEligibilityLoading &&
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

  const payPalCardFieldsOneTimePayment = isLoading ? (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      Loading card fields...
    </div>
  ) : eligibilityError ? (
    <div style={{ padding: "1rem", textAlign: "center", color: "red" }}>
      Failed to load card fields. Please refresh the page.
    </div>
  ) : (
    <>
      {isCardFieldsEligible && (
        <PayPalCardFieldsProvider change={handleChange} blur={handleBlur}>
          <PayPalCardFieldsOneTimePayment
            setModalState={setModalState}
            fieldsState={fieldsState}
            touchedFields={touchedFields}
            setAllTouched={setAllTouched}
          />
        </PayPalCardFieldsProvider>
      )}
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
