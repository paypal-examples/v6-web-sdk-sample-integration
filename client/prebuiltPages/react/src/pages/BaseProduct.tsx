import { useNavigate } from "react-router-dom";
import ProductDisplay from "../components/ProductDisplay";
import { useProducts } from "../hooks/useProducts";
import { useQuantityChange } from "../hooks/useQuantityChange";
import "../styles/Product.css";

interface ProductPageProps {
  flowType: "one-time-payment" | "save-payment" | "subscription" | "vault-with-purchase";
}

const BaseProduct = ({ flowType }: ProductPageProps) => {
  const { products, setProducts, loading } = useProducts({
    restoreFromCart: true,
  });
  const navigate = useNavigate();
  const handleQuantityChange = useQuantityChange(setProducts);

  const handleAddToCart = () => {
    const selectedProducts = products.filter((p) => p.quantity > 0);
    sessionStorage.setItem("cart", JSON.stringify(selectedProducts));
    navigate(`/${flowType}/cart`);
  };

  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);

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
    <div className="product-page-container">
      <ProductDisplay
        products={products}
        onQuantityChange={handleQuantityChange}
      />

      <div className="cart-actions">
        <button
          className="add-to-cart-button"
          onClick={handleAddToCart}
          disabled={totalItems === 0}
        >
          Add to Cart {totalItems > 0 && `(${totalItems} items)`}
        </button>
      </div>
    </div>
  );
};

export default BaseProduct;
