import { useState, useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ProductDisplay from "../components/ProductDisplay";
import PaymentModal from "../components/PaymentModal";
import type {
  ModalType,
  ModalContent,
  ProductItem,
  ProductPrice,
} from "../types";
import { PRODUCT_DATA } from "../constants/products";
import { fetchProducts } from "../utils";
import { useCartTotals } from "../hooks/useCartTotals";
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
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productPrices: ProductPrice[] = await fetchProducts();

        const productsWithPricing: ProductItem[] = productPrices
          .map((productPrice) => {
            const productData = PRODUCT_DATA[productPrice.sku];
            if (!productData) {
              console.warn(
                `No product data found for SKU: ${productPrice.sku}`,
              );
              return null;
            }
            return {
              ...productData,
              sku: productPrice.sku,
              price: parseFloat(productPrice.price),
              quantity: 0,
            };
          })
          .filter(Boolean) as ProductItem[];

        setProducts(productsWithPricing);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleQuantityChange = (id: number, quantity: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, quantity } : product,
      ),
    );
  };

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
