import { useState, useCallback } from "react";
import {
  type OnApproveDataOneTimePayments,
  type OnCompleteData,
} from "@paypal/react-paypal-js/sdk-v6";
import PayPalSubscriptionButton from "../components/PayPalSubscriptionButton";
import ProductDisplay from "../components/ProductDisplay";
import PaymentModal from "../components/PaymentModal";

import soccerBallImage from "../images/world-cup.jpg";
import basketballImage from "../images/basket-ball.jpeg";
import baseballImage from "../images/base-ball.jpeg";
import hockeyPuckImage from "../images/hockey-puck.jpeg";
import { createSubscription } from "../utils";
import "../styles/SoccerBall.css";
import "../styles/Modal.css";

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

  return (
    <div className="soccer-ball-container" data-testid="soccer-ball-container">
      {modalContent && (
        <PaymentModal
          content={modalContent}
          onClose={() => setModalState(null)}
        />
      )}

      <ProductDisplay
        products={products}
        onQuantityChange={handleQuantityChange}
      />

      <div className="payment-options">
        <PayPalSubscriptionButton
          createSubscription={createSubscription}
          presentationMode="auto"
          {...handleSubscriptionCallbacks}
        />
      </div>
    </div>
  );
};

export default SoccerBall;
