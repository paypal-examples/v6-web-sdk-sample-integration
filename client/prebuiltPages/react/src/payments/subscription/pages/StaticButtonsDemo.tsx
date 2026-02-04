import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  type OnApproveDataOneTimePayments,
  type OnCompleteData,
} from "@paypal/react-paypal-js/sdk-v6";
import PayPalSubscriptionButton from "../components/PayPalSubscriptionButton";
import ProductDisplay from "../../../components/ProductDisplay";
import PaymentModal from "../components/PaymentModal";

import soccerBallImage from "../../../images/world-cup.jpg";
import basketballImage from "../../../images/basket-ball.jpeg";
import baseballImage from "../../../images/base-ball.jpeg";
import hockeyPuckImage from "../../../images/hockey-puck.jpeg";
import { createSubscription } from "../utils";
import "../../../styles/SoccerBall.css";
import "../../../styles/Modal.css";

// Types
type ModalType = "success" | "cancel" | "error" | null;

interface ModalContent {
  title: string;
  message: string;
}

interface ProductItem {
  id: number;
  name: string;
  icon: string;
  price: number;
  image: {
    src: string;
    alt: string;
  };
  quantity: number;
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 1,
    name: "World Cup Ball",
    icon: "⚽️",
    price: 100.0,
    image: { src: soccerBallImage, alt: "World Cup Soccer Ball" },
    quantity: 0,
  },
  {
    id: 2,
    name: "Professional Basketball",
    icon: "🏀",
    price: 100.0,
    image: { src: basketballImage, alt: "Professional Basketball" },
    quantity: 0,
  },
  {
    id: 3,
    name: "Official Baseball",
    icon: "⚾️",
    price: 100.0,
    image: { src: baseballImage, alt: "Official Baseball" },
    quantity: 0,
  },
  {
    id: 4,
    name: "Hockey Puck",
    icon: "🏒",
    price: 100.0,
    image: { src: hockeyPuckImage, alt: "Hockey Puck" },
    quantity: 0,
  },
];

const SoccerBall = () => {
  const [modalState, setModalState] = useState<ModalType>(null);
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);

  const handleQuantityChange = (id: number, quantity: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, quantity } : product,
      ),
    );
  };

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

  // Calculate totals
  const total = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0,
  );
  const totalItems = products.reduce(
    (sum, product) => sum + product.quantity,
    0,
  );

  return (
    <div className="soccer-ball-container" data-testid="soccer-ball-container">
      <div style={{ marginBottom: "20px", textAlign: "center", width: "100%" }}>
        <Link
          to="/"
          style={{
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#0070ba",
            color: "white",
            textDecoration: "none",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ← Back to Home
        </Link>
      </div>

      {modalContent && (
        <PaymentModal
          content={modalContent}
          onClose={() => setModalState(null)}
        />
      )}

      <div className="main-content-wrapper">
        <div className="products-section">
          <ProductDisplay
            products={products}
            onQuantityChange={handleQuantityChange}
          />
        </div>

        <div className="payment-section">
          <div className="checkout-summary">
            <p>
              Total: ${total.toFixed(2)} ({totalItems}{" "}
              {totalItems === 1 ? "item" : "items"})
            </p>
            <p>Taxes, discounts and shipping calculated at checkout</p>
          </div>

          <div className="payment-options">
            <PayPalSubscriptionButton
              createSubscription={createSubscription}
              presentationMode="auto"
              {...handleSubscriptionCallbacks}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoccerBall;
