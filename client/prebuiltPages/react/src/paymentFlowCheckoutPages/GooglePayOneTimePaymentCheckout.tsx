import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  usePayPal,
  useEligibleMethods,
  INSTANCE_LOADING_STATE,
  GooglePayOneTimePaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";
import BaseCheckout from "../pages/BaseCheckout";
import type { ModalType, ModalContent, ProductItem } from "../types";
import { captureOrder, createOrder } from "../utils";

const GooglePayOneTimePaymentCheckout = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const lastOrderIdRef = useRef<string | null>(null);
  const { loadingStatus } = usePayPal();
  const navigate = useNavigate();
  const { eligiblePaymentMethods, error: eligibilityError } = useEligibleMethods({
    payload: {
      currencyCode: "USD",
    },
  });

  const getGoogleTransactionInfo = useCallback(
    (purchaseAmount: string, countryCode: string) => {
      const totalAmount = parseFloat(purchaseAmount);
      const subtotal = (totalAmount * 0.9).toFixed(2);
      const tax = (totalAmount * 0.1).toFixed(2);

      return {
        displayItems: [
          {
            label: "Subtotal",
            type: "SUBTOTAL",
            price: subtotal,
          },
          {
            label: "Tax",
            type: "TAX",
            price: tax,
          },
        ],
        countryCode,
        currencyCode: "USD",
        totalPriceStatus: "FINAL" as const,
        totalPrice: purchaseAmount,
        totalPriceLabel: "Total",
      };
    },
    [],
  );

  const getCartProducts = (): ProductItem[] => {
    const savedCart = sessionStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  };

  const getCartTotal = (): string => {
    const products = getCartProducts();
    const total = products.reduce((sum, item) => {
      if (item.price !== undefined) {
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);

    return total.toFixed(2);
  };

  const handleCreateOrder = async () => {
    const products = getCartProducts();

    const cart = products.map((product) => ({
      sku: product.sku,
      quantity: product.quantity,
    }));

    const order = await createOrder(cart);
    lastOrderIdRef.current = order.orderId;
    return order;
  };

  const getModalContent = useCallback(
    (state: ModalType): ModalContent | null => {
      switch (state) {
        case "success":
          return {
            title: "Payment Successful! 🎉",
            message: "Thank you for your Google Pay purchase!",
          };
        case "cancel":
          return {
            title: "Payment Cancelled",
            message: "Your Google Pay payment was cancelled.",
          };
        case "error":
          return {
            title: "Payment Error",
            message:
              "There was an error processing your Google Pay payment. Please try again.",
          };
        default:
          return null;
      }
    },
    [],
  );

  const isLoading =
    loadingStatus === INSTANCE_LOADING_STATE.PENDING;

  const googlePayConfig =
    eligiblePaymentMethods?.isEligible("googlepay")
      ? eligiblePaymentMethods.getDetails("googlepay").config
      : null;

  const handleModalClose = () => {
    setModalState(null);
    if (modalState === "success") {
      navigate("/");
    }
  };

  const paymentButtons = isLoading ? (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      Loading payment methods...
    </div>
  ) : eligibilityError ? (
    <div style={{ padding: "1rem", textAlign: "center", color: "red" }}>
      Failed to load payment options. Please refresh the page.
    </div>
  ) : !eligiblePaymentMethods ? (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      Loading payment methods...
    </div>
  ) : !eligiblePaymentMethods.isEligible("googlepay") ? (
    <div style={{ padding: "1rem", textAlign: "center", color: "#856404" }}>
      Google Pay is not eligible for this transaction.
    </div>
  ) : googlePayConfig ? (
    <div>
      <GooglePayOneTimePaymentButton
        googlePayConfig={googlePayConfig}
        transactionInfo={getGoogleTransactionInfo(getCartTotal(), "US")}
        environment="TEST"
        createOrder={handleCreateOrder}
        onApprove={async (data) => {
          console.log("Google Pay payment approved:", data);

          if (data.status !== "PAYER_ACTION_REQUIRED" && lastOrderIdRef.current) {
            const orderId = lastOrderIdRef.current;
            const captureResult = await captureOrder({ orderId });
            console.log("Google Pay capture result:", captureResult);
          }

          sessionStorage.removeItem("cart");
          setModalState("success");
        }}
        onCancel={() => {
          console.log("Google Pay payment cancelled");
          setModalState("cancel");
        }}
        onError={(error) => {
          console.error("Google Pay payment error:", error);
          setModalState("error");
        }}
        buttonType="pay"
        buttonColor="default"
        buttonSizeMode="fill"
      />
    </div>
  ) : (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      Loading Google Pay configuration...
    </div>
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

export default GooglePayOneTimePaymentCheckout;
