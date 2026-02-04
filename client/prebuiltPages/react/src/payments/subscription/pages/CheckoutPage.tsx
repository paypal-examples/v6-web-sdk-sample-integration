import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  type OnApproveDataOneTimePayments,
  type OnCompleteData,
} from "@paypal/react-paypal-js/sdk-v6";
import PayPalSubscriptionButton from "../components/PayPalSubscriptionButton";
import PaymentModal from "../components/PaymentModal";
import type { ProductItem } from "./ProductPage";
import { createSubscription } from "../utils";
import "../../../styles/CheckoutPage.css";

type ModalType = "success" | "cancel" | "error" | null;

interface ModalContent {
  title: string;
  message: string;
}

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<ProductItem[]>([]);
  const [modalState, setModalState] = useState<ModalType>(null);
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

  const handleSubscriptionCallbacks = {
    onApprove: async (data: OnApproveDataOneTimePayments) => {
      console.log("Subscription approved:", data);
      console.log("Payer ID:", data.payerId);
      setModalState("success");
    },

    onCancel: () => {
      console.log("Subscription cancelled");
      setModalState("cancel");
    },

    onError: (error: Error) => {
      console.error("Subscription error:", error);
      setModalState("error");
    },

    onComplete: (data: OnCompleteData) => {
      console.log("Subscription session completed");
      console.log("On Complete data:", data);
    },
  };

  const getModalContent = useCallback(
    (state: ModalType): ModalContent | null => {
      switch (state) {
        case "success":
          return {
            title: "Subscription Created! 🎉",
            message: "Your subscription has been successfully set up!",
          };
        case "cancel":
          return {
            title: "Subscription Cancelled",
            message: "Your subscription setup was cancelled.",
          };
        case "error":
          return {
            title: "Subscription Error",
            message:
              "There was an error setting up your subscription. Please try again.",
          };
        default:
          return null;
      }
    },
    [],
  );

  const modalContent = getModalContent(modalState);
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
            <PayPalSubscriptionButton
              createSubscription={createSubscription}
              presentationMode="auto"
              {...handleSubscriptionCallbacks}
            />
          </div>

          <button
            className="back-to-cart-button"
            onClick={() => navigate("/subscription/cart")}
          >
            ← Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
