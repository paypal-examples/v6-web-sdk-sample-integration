import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ProductDisplay from "../components/ProductDisplay";
import PaymentModal from "../components/PaymentModal";
import type { ModalType, ModalContent, ProductItem } from "../types";
import { INITIAL_PRODUCTS } from "../constants/products";
import "../styles/StaticButtons.css";

interface BaseStaticButtonsProps {
  paymentButtons: (products: ProductItem[]) => ReactNode;
  getModalContent: (state: ModalType) => ModalContent | null;
  modalState: ModalType;
  onModalClose: () => void;
}

const BaseStaticButtons = ({
  paymentButtons,
  getModalContent,
  modalState,
  onModalClose,
}: BaseStaticButtonsProps) => {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);

  const handleQuantityChange = (id: number, quantity: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, quantity } : product,
      ),
    );
  };

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
        <PaymentModal content={modalContent} onClose={onModalClose} />
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

          <div className="payment-options">{paymentButtons(products)}</div>
        </div>
      </div>
    </div>
  );
};

export default BaseStaticButtons;
