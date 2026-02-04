import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  usePayPal,
  INSTANCE_LOADING_STATE,
  type OnApproveDataOneTimePayments,
  type OnCompleteData,
} from "@paypal/react-paypal-js/sdk-v6";
import PayPalButton from "../components/PayPalButton";
import VenmoButton from "../components/VenmoButton";
import PayLaterButton from "../components/PayLaterButton";
import PayPalBasicCardButton from "../components/PayPalBasicCardButton";
import PayPalCreditOneTimeButton from "../components/PayPalCreditOneTimeButton";
import PaymentModal from "../components/PaymentModal";
import type { ProductItem } from "./ProductPage";
import { captureOrder, createOrder } from "../utils";
import "../../../styles/CheckoutPage.css";

type ModalType = "success" | "cancel" | "error" | null;

interface ModalContent {
  title: string;
  message: string;
}

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<ProductItem[]>([]);
  const [modalState, setModalState] = useState<ModalType>(null);
  const { loadingStatus, eligiblePaymentMethods } = usePayPal();
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = sessionStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCreateOrder = async () => {
    return await createOrder(cartItems);
  };

  const handlePaymentCallbacks = {
    onApprove: async (data: OnApproveDataOneTimePayments) => {
      console.log("Payment approved:", data);
      const captureResult = await captureOrder({ orderId: data.orderId });
      console.log("Payment capture result:", captureResult);

      sessionStorage.removeItem("cart");
      setModalState("success");
    },

    onCancel: () => {
      console.log("Payment cancelled");
      setModalState("cancel");
    },

    onError: (error: Error) => {
      console.error("Payment error:", error);
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

  const modalContent = getModalContent(modalState);
  const isSDKLoading =
    loadingStatus === INSTANCE_LOADING_STATE.PENDING || !eligiblePaymentMethods;

  const handleModalClose = () => {
    setModalState(null);
    if (modalState === "success") {
      navigate("/");
    }
  };

  return (
    <div className="checkout-page-container">
      {modalContent && (
        <PaymentModal content={modalContent} onClose={handleModalClose} />
      )}

      <h1>Checkout</h1>

      <div className="checkout-content">
        <div className="checkout-summary">
          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div key={item.id} className="checkout-item">
              <img src={item.image.src} alt={item.image.alt} />
              <div className="checkout-item-details">
                <p>
                  {item.icon} {item.name}
                </p>
                <p className="checkout-item-qty">
                  Qty: {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="checkout-item-total">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          <div className="checkout-totals">
            <div className="checkout-row total">
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <p
              style={{
                fontSize: "0.9em",
                color: "#666",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              Taxes and shipping calculated at payment
            </p>
          </div>
        </div>

        <div className="payment-section">
          <h2>Payment Method</h2>
          <p className="payment-description">
            Select your preferred payment method below
          </p>

          <div className="payment-options">
            {isSDKLoading ? (
              <div style={{ padding: "1rem", textAlign: "center" }}>
                Loading payment methods...
              </div>
            ) : (
              <>
                <PayPalButton
                  createOrder={handleCreateOrder}
                  presentationMode="auto"
                  {...handlePaymentCallbacks}
                />

                <VenmoButton
                  createOrder={handleCreateOrder}
                  presentationMode="auto"
                  {...handlePaymentCallbacks}
                />

                <PayLaterButton
                  createOrder={handleCreateOrder}
                  presentationMode="auto"
                  {...handlePaymentCallbacks}
                />

                <PayPalBasicCardButton
                  createOrder={handleCreateOrder}
                  {...handlePaymentCallbacks}
                />

                <PayPalCreditOneTimeButton
                  createOrder={handleCreateOrder}
                  presentationMode="auto"
                  {...handlePaymentCallbacks}
                />
              </>
            )}
          </div>

          <button
            className="back-to-cart-button"
            onClick={() => navigate("/cart")}
          >
            ← Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
