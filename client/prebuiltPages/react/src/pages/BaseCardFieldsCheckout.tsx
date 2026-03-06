import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import PaymentModal from "../components/PaymentModal";
import type { ProductItem, ModalType, ModalContent } from "../types";
import { useCartTotals } from "../hooks/useCartTotals";
import "../styles/Checkout.css";

interface CheckoutCardFieldsPageProps {
  flowType: "one-time-payment" | "save-payment" | "subscription";
  modalState: ModalType;
  onModalClose: () => void;
  getModalContent: (state: ModalType) => ModalContent | null;
  cardFieldComponents: ReactNode;
}

const BaseCardFieldsCheckout = ({
  flowType,
  modalState,
  onModalClose,
  getModalContent,
  cardFieldComponents,
}: CheckoutCardFieldsPageProps) => {
  const [cartItems] = useState<ProductItem[]>(() => {
    const savedCart = sessionStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem("cart")) {
      navigate(`/${flowType}/card-fields`);
    }
  }, [navigate, flowType]);

  const { totalItems, total } = useCartTotals(cartItems);

  const modalContent = getModalContent(modalState);

  return (
    <div className="checkout-page-container">
      {modalContent && (
        <PaymentModal content={modalContent} onClose={onModalClose} />
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
                <p className="checkout-item-qty">Qty: {item.quantity}</p>
                {item.price !== undefined && (
                  <p className="checkout-item-price">
                    ${item.price.toFixed(2)} each
                  </p>
                )}
              </div>
              {item.price !== undefined && (
                <div className="checkout-item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              )}
            </div>
          ))}

          <div className="checkout-totals">
            <div className="checkout-row total">
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="checkout-row">
              <span>Total Items:</span>
              <span>{totalItems}</span>
            </div>
            <p
              style={{
                fontSize: "0.9em",
                color: "#666",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              Taxes and shipping calculated at checkout
            </p>
          </div>
        </div>

        <div className="payment-section">
          <h2>Card Fields</h2>
          <p className="payment-description">Enter your card details below</p>

          <div className="payment-options">{cardFieldComponents}</div>

          <button
            className="back-to-cart-button"
            onClick={() => navigate(`/${flowType}/card-fields/cart`)}
          >
            ← Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaseCardFieldsCheckout;
