import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import ProductDisplay from "../components/ProductDisplay";
import PaymentModal from "../components/PaymentModal";
import type { ModalType, ModalContent, ProductItem } from "../types";
import { useCartTotals } from "../hooks/useCartTotals";
import { useProducts } from "../hooks/useProducts";
import { useQuantityChange } from "../hooks/useQuantityChange";
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
  const { products, setProducts, loading } = useProducts();
  const handleQuantityChange = useQuantityChange(setProducts);

  const modalContent = getModalContent(modalState);

  const { totalItems, total } = useCartTotals(products);

  if (loading) {
    return (
      <div className="product-page-container">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading products...
        </div>
      </div>
    );
  }

  return (
    <div
      className="static-button-container"
      data-testid="static-button-container"
    >
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
            <p>Subtotal: ${total.toFixed(2)}</p>
            <p style={{ fontSize: "0.9em", color: "#666" }}>
              Total: {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
            <p
              style={{ fontSize: "0.85em", color: "#999", marginTop: "0.5rem" }}
            >
              Taxes and shipping calculated at checkout
            </p>
          </div>

          <div className="payment-options">{paymentButtons(products)}</div>
        </div>
      </div>
    </div>
  );
};

export default BaseStaticButtons;
