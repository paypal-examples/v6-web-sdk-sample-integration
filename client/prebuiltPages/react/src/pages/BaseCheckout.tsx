import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import PaymentModal from "../components/PaymentModal";
import type { ProductItem, ModalType, ModalContent } from "../types";
import { useCartTotals } from "../hooks/useCartTotals";
import "../styles/Checkout.css";

interface CheckoutPageProps {
  flowType: "one-time-payment" | "save-payment" | "subscription";
  modalState: ModalType;
  onModalClose: () => void;
  getModalContent: (state: ModalType) => ModalContent | null;
  paymentButtons: ReactNode;
}

const BaseCheckout = ({
  flowType,
  modalState,
  onModalClose,
  getModalContent,
  paymentButtons,
}: CheckoutPageProps) => {
  const [cartItems, setCartItems] = useState<ProductItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = sessionStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    } else {
      navigate(`/${flowType}`);
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
          <h2>Payment Method</h2>
          <p className="payment-description">
            Select your preferred payment method below
          </p>

          <div className="payment-options">{paymentButtons}</div>

          <button
            className="back-to-cart-button"
            onClick={() => navigate(`/${flowType}/cart`)}
          >
            ← Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaseCheckout;
