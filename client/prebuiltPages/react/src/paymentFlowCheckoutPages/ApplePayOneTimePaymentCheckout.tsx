import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  usePayPal,
  useEligibleMethods,
  INSTANCE_LOADING_STATE,
  ApplePayOneTimePaymentButton,
  type ApplePayConfig,
} from "@paypal/react-paypal-js/sdk-v6";
import BaseCheckout from "../pages/BaseCheckout";
import type { ModalType, ModalContent, ProductItem } from "../types";
import { captureOrder, createOrder } from "../utils";

/**
 * Checkout page for Apple Pay one-time payments.
 *
 * Uses useEligibleMethods to fetch Apple Pay config, then renders
 * ApplePayOneTimePaymentButton which handles the full payment lifecycle.
 */
const ApplePayOneTimePaymentCheckout = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const [applePayConfig, setApplePayConfig] = useState<ApplePayConfig | null>(
    null,
  );
  const { loadingStatus } = usePayPal();
  const navigate = useNavigate();

  const { eligiblePaymentMethods, error: eligibilityError } =
    useEligibleMethods({
      payload: {
        currencyCode: "USD",
      },
    });

  // Extract Apple Pay config once eligibility is resolved
  useEffect(() => {
    if (eligiblePaymentMethods?.isEligible("applepay")) {
      const details = eligiblePaymentMethods.getDetails("applepay");
      setApplePayConfig(details.config);
    }
  }, [eligiblePaymentMethods]);

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

    return await createOrder(cart);
  };

  const getModalContent = useCallback(
    (state: ModalType): ModalContent | null => {
      switch (state) {
        case "success":
          return {
            title: "Payment Successful! 🎉",
            message: "Thank you for your Apple Pay purchase!",
          };
        case "cancel":
          return {
            title: "Payment Cancelled",
            message: "Your Apple Pay payment was cancelled.",
          };
        case "error":
          return {
            title: "Payment Error",
            message:
              "There was an error processing your Apple Pay payment. Please try again.",
          };
        default:
          return null;
      }
    },
    [],
  );

  const isLoading = loadingStatus === INSTANCE_LOADING_STATE.PENDING;
  const isHttps =
    typeof window !== "undefined" &&
    window.location.protocol === "https:";
  // Skip ApplePaySession check for sandbox/dev testing
  const isApplePayAvailable = isHttps;

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
  ) : !isHttps ? (
    <div style={{ padding: "1rem", textAlign: "center", color: "#856404" }}>
      Apple Pay requires a secure (HTTPS) connection. Please access this page
      over HTTPS.
    </div>
  ) : !isApplePayAvailable ? (
    <div style={{ padding: "1rem", textAlign: "center", color: "#856404" }}>
      Apple Pay is not available on this device or browser. Please use Safari on
      a supported Apple device.
    </div>
  ) : eligibilityError ? (
    <div style={{ padding: "1rem", textAlign: "center", color: "red" }}>
      Failed to load payment options. Please refresh the page.
    </div>
  ) : !eligiblePaymentMethods ? (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      Loading payment methods...
    </div>
  ) : !eligiblePaymentMethods.isEligible("applepay") ? (
    <div style={{ padding: "1rem", textAlign: "center", color: "#856404" }}>
      Apple Pay is not eligible for this transaction.
    </div>
  ) : applePayConfig ? (
    <div>
      <ApplePayOneTimePaymentButton
        applePayConfig={applePayConfig}
        applePaySessionVersion={14}
        domainName="v6-web-sdk-sample-integration-server.fly.dev"
        paymentRequest={{
        countryCode: "US",
        currencyCode: "USD",
        requiredBillingContactFields: [
          "name",
          "phone",
          "email",
          "postalAddress",
        ],
        requiredShippingContactFields: [],
        total: {
          label: "Demo (Card is not charged)",
          amount: getCartTotal(),
          type: "final",
        },
      }}
      buttonstyle="black"
      type="buy"
      locale="en"
      createOrder={handleCreateOrder}
      onApprove={async (data) => {
        console.log("Apple Pay payment approved:", data);
        const orderId = data.approveApplePayPayment.id;
        const captureResult = await captureOrder({ orderId });
        console.log("Apple Pay capture result:", captureResult);
        sessionStorage.removeItem("cart");
        setModalState("success");
      }}
      onCancel={() => {
        console.log("Apple Pay payment cancelled");
        setModalState("cancel");
      }}
      onError={(error) => {
        console.error("Apple Pay payment error:", error);
        setModalState("error");
      }}
    />
    </div>
  ) : (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      Loading Apple Pay configuration...
    </div>
  );

  return (
    <BaseCheckout
      flowType="one-time-payment"
      paymentMethod="apple-pay"
      modalState={modalState}
      onModalClose={handleModalClose}
      getModalContent={getModalContent}
      paymentButtons={paymentButtons}
    />
  );
};

export default ApplePayOneTimePaymentCheckout;
