import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
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
import ProductDisplay from "../components/ProductDisplay";
import PaymentModal from "../components/PaymentModal";

import soccerBallImage from "../images/world-cup.jpg";
import basketballImage from "../images/basket-ball.jpeg";
import baseballImage from "../images/base-ball.jpeg";
import hockeyPuckImage from "../images/hockey-puck.jpeg";
import { captureOrder, createOrder } from "../utils";
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
  const { loadingStatus, eligiblePaymentMethods } = usePayPal();

  const handleQuantityChange = (id: number, quantity: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, quantity } : product,
      ),
    );
  };

  const handlePaymentCallbacks = {
    onApprove: async (data: OnApproveDataOneTimePayments) => {
      console.log("Payment approved:", data);
      const captureResult = await captureOrder({ orderId: data.orderId });
      console.log("Payment capture result:", captureResult);
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

  // Check if SDK is still loading OR eligibility hasn't been fetched yet
  // This ensures all buttons (including PayLater which needs eligibility data) appear together
  const isSDKLoading =
    loadingStatus === INSTANCE_LOADING_STATE.PENDING || !eligiblePaymentMethods;

  // Wrapper function that captures cart items from products state
  const handleCreateOrder = useCallback(async () => {
    const cartItems = products
      .filter((product) => product.quantity > 0)
      .map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
      }));

    return await createOrder(cartItems);
  }, [products]);

  return (
    <div className="soccer-ball-container" data-testid="soccer-ball-container">
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
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

      <ProductDisplay
        products={products}
        onQuantityChange={handleQuantityChange}
      />

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
    </div>
  );
};

export default SoccerBall;
