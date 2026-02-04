import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  type OnApproveDataSavePayments,
  type OnCompleteData,
} from "@paypal/react-paypal-js/sdk-v6";
import PayPalSaveButton from "../components/PayPalSaveButton";
import PayPalCreditSaveButton from "../components/PayPalCreditSaveButton";
import ProductDisplay from "../../../components/ProductDisplay";
import PaymentModal from "../components/PaymentModal";

import soccerBallImage from "../../../images/world-cup.jpg";
import basketballImage from "../../../images/basket-ball.jpeg";
import baseballImage from "../../../images/base-ball.jpeg";
import hockeyPuckImage from "../../../images/hockey-puck.jpeg";
import { createVaultToken } from "../utils";
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

  const handleSaveCallbacks = {
    onApprove: async (data: OnApproveDataSavePayments) => {
      console.log("Payment method saved:", data);
      console.log("Vault Setup Token:", data.vaultSetupToken);
      setModalState("success");
    },

    onCancel: () => {
      console.log("Save payment method cancelled");
      setModalState("cancel");
    },

    onError: (error: Error) => {
      console.error("Save payment method error:", error);
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
            title: "Payment Method Saved! 🎉",
            message:
              "Your payment method has been securely saved for future use.",
          };
        case "cancel":
          return {
            title: "Save Cancelled",
            message: "Saving your payment method was cancelled.",
          };
        case "error":
          return {
            title: "Save Error",
            message:
              "There was an error saving your payment method. Please try again.",
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
            <div>
              <PayPalSaveButton
                createVaultToken={createVaultToken}
                presentationMode="auto"
                {...handleSaveCallbacks}
              />
            </div>

            <div>
              <PayPalCreditSaveButton
                createVaultToken={createVaultToken}
                presentationMode="auto"
                {...handleSaveCallbacks}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoccerBall;
