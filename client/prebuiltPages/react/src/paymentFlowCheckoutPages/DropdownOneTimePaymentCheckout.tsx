import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  usePayPal,
  useEligibleMethods,
  INSTANCE_LOADING_STATE,
  PayPalOneTimePaymentButton,
  VenmoOneTimePaymentButton,
  PayLaterOneTimePaymentButton,
  PayPalGuestPaymentButton,
  PayPalCreditOneTimePaymentButton,
  type OnApproveDataOneTimePayments,
  type OnErrorData,
  type OnCompleteData,
  type OnCancelDataOneTimePayments,
} from "@paypal/react-paypal-js/sdk-v6";
import BaseCheckout from "../pages/BaseCheckout";
import PaymentMethodDropdown, {
  type PaymentMethodOption,
} from "../components/PaymentMethodDropdown";
import type { ModalType, ModalContent, ProductItem } from "../types";
import { captureOrder, createOrder } from "../utils";

/**
 * Checkout page for one-time payments that presents every eligible payment
 * method inside a single collapsible dropdown instead of a vertical stack of
 * buttons (see OneTimePaymentCheckout.tsx for the stacked variant).
 *
 * Uses useEligibleMethods to check payment method eligibility for one-time
 * payments — the same eligibility logic as the stacked checkout.
 */
const DropdownOneTimePaymentCheckout = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const { loadingStatus } = usePayPal();
  const navigate = useNavigate();

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

  const handleCreateOrder = async () => {
    const savedCart = sessionStorage.getItem("cart");
    const products: ProductItem[] = savedCart ? JSON.parse(savedCart) : [];

    const cart = products.map((product) => ({
      sku: product.sku,
      quantity: product.quantity,
    }));

    return await createOrder(cart);
  };

  const handlePaymentCallbacks = {
    onApprove: async (data: OnApproveDataOneTimePayments) => {
      console.log("Payment approved:", data);
      const captureResult = await captureOrder({ orderId: data.orderId });
      console.log("Payment capture result:", captureResult);

      sessionStorage.removeItem("cart");
      setModalState("success");
    },

    onCancel: (data: OnCancelDataOneTimePayments) => {
      console.log("Payment cancelled:", data);
      setModalState("cancel");
    },

    onError: (data: OnErrorData) => {
      console.error("Payment error:", data);
      setModalState("error");
    },

    onComplete: (data: OnCompleteData) => {
      console.log("Payment session completed");
      console.log("On Complete data:", data);
    },
  };

  const getModalContent = useCallback(
    (state: ModalType): ModalContent | null => {
      switch (state) {
        case "success":
          return {
            title: "Payment Successful! 🎉",
            message: "Thank you for your purchase!",
          };
        case "cancel":
          return {
            title: "Payment Cancelled",
            message: "Your payment was cancelled.",
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
  const isVenmoEligible =
    !isEligibilityLoading && eligiblePaymentMethods?.isEligible("venmo");
  const isPayLaterEligible =
    !isEligibilityLoading && eligiblePaymentMethods?.isEligible("paylater");
  const isCreditEligible =
    !isEligibilityLoading && eligiblePaymentMethods?.isEligible("credit");

  const handleModalClose = () => {
    setModalState(null);
    if (modalState === "success") {
      navigate("/");
    }
  };

  // Build the list of eligible methods to offer in the dropdown.
  // Venmo, Pay Later and PayPal Credit are added only
  // when eligible — the same predicates the stacked checkout uses.
  const paymentMethodOptions: PaymentMethodOption[] = [
    {
      key: "paypal",
      label: "PayPal",
      button: (
        <PayPalOneTimePaymentButton
          createOrder={handleCreateOrder}
          presentationMode="auto"
          {...handlePaymentCallbacks}
        />
      ),
    },
    ...(isVenmoEligible
      ? [
          {
            key: "venmo",
            label: "Venmo",
            button: (
              <VenmoOneTimePaymentButton
                createOrder={handleCreateOrder}
                presentationMode="auto"
                {...handlePaymentCallbacks}
              />
            ),
          },
        ]
      : []),
    ...(isPayLaterEligible
      ? [
          {
            key: "paylater",
            label: "Pay Later",
            button: (
              <PayLaterOneTimePaymentButton
                createOrder={handleCreateOrder}
                presentationMode="auto"
                {...handlePaymentCallbacks}
              />
            ),
          },
        ]
      : []),
    ...(isCreditEligible
      ? [
          {
            key: "credit",
            label: "PayPal Credit",
            button: (
              <PayPalCreditOneTimePaymentButton
                createOrder={handleCreateOrder}
                presentationMode="auto"
                {...handlePaymentCallbacks}
              />
            ),
          },
        ]
      : []),
    {
      key: "guest",
      label: "Pay with Debit or Credit Card",
      button: (
        <PayPalGuestPaymentButton
          createOrder={handleCreateOrder}
          {...handlePaymentCallbacks}
        />
      ),
    },
  ];

  const paymentButtons = isLoading ? (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      Loading payment methods...
    </div>
  ) : eligibilityError ? (
    <div style={{ padding: "1rem", textAlign: "center", color: "red" }}>
      Failed to load payment options. Please refresh the page.
    </div>
  ) : (
    <PaymentMethodDropdown options={paymentMethodOptions} />
  );

  return (
    <BaseCheckout
      flowType="one-time-payment"
      modalState={modalState}
      onModalClose={handleModalClose}
      getModalContent={getModalContent}
      paymentButtons={paymentButtons}
    />
  );
};

export default DropdownOneTimePaymentCheckout;
