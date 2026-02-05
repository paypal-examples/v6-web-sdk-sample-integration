import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ProductItem } from "../types";
import { useCartTotals } from "../hooks/useCartTotals";
import "../styles/Cart.css";

interface CartPageProps {
  flowType: "one-time-payment" | "save-payment" | "subscription";
}

const BaseCart = ({ flowType }: CartPageProps) => {
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

  const handleQuantityChange = (id: number, newQuantity: number) => {
    const updatedCart = cartItems
      .map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      )
      .filter((item) => item.quantity > 0);

    setCartItems(updatedCart);
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleRemoveItem = (id: number) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleContinueShopping = () => {
    navigate(`/${flowType}`);
  };

  const handleCheckout = () => {
    navigate(`/${flowType}/checkout`);
  };

  const { totalItems, total } = useCartTotals(cartItems);

  if (cartItems.length === 0) {
    return (
      <div className="cart-page-container">
        <h1>Shopping Cart</h1>
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button
            className="continue-shopping-button"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <h1>Shopping Cart</h1>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={item.image.src}
                alt={item.image.alt}
                className="cart-item-image"
              />

              <div className="cart-item-details">
                <h3>
                  {item.icon} {item.name}
                </h3>
                {item.price !== undefined && (
                  <p className="cart-item-price">
                    ${item.price.toFixed(2)} each
                  </p>
                )}
              </div>

              <div className="cart-item-quantity">
                <label htmlFor={`cart-qty-${item.id}`}>Qty:</label>
                <select
                  id={`cart-qty-${item.id}`}
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.id, Number(e.target.value))
                  }
                  className="cart-quantity-dropdown"
                >
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              {item.price !== undefined && (
                <div className="cart-item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              )}

              <button
                className="cart-item-remove"
                onClick={() => handleRemoveItem(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row total">
            <span>Subtotal:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Total Items:</span>
            <span>{totalItems}</span>
          </div>
          <p style={{ fontSize: "0.9em", color: "#666", marginTop: "10px" }}>
            Taxes and shipping calculated at checkout
          </p>

          <button className="checkout-button" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
          <button
            className="continue-shopping-button"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaseCart;
