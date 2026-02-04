import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ProductDisplay from "../components/ProductDisplay";
import type { ProductItem } from "../types";
import { INITIAL_PRODUCTS } from "../constants/products";
import "../styles/Product.css";

interface ProductPageProps {
  flowType: "one-time-payment" | "save-payment" | "subscription";
}

const BaseProduct = ({ flowType }: ProductPageProps) => {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = sessionStorage.getItem("cart");
    if (savedCart) {
      const cartItems: ProductItem[] = JSON.parse(savedCart);
      setProducts((prevProducts) =>
        prevProducts.map((product) => {
          const cartItem = cartItems.find((item) => item.id === product.id);
          return cartItem
            ? { ...product, quantity: cartItem.quantity }
            : product;
        }),
      );
    }
  }, []);

  const handleQuantityChange = (id: number, quantity: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, quantity } : product,
      ),
    );
  };

  const handleAddToCart = () => {
    const selectedProducts = products.filter((p) => p.quantity > 0);
    sessionStorage.setItem("cart", JSON.stringify(selectedProducts));
    navigate(`/${flowType}/cart`);
  };

  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="product-page-container">
      <div
        style={{
          marginBottom: "30px",
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          to={`/${flowType}/static-demo`}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#0070ba",
            color: "white",
            textDecoration: "none",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          📄 Static Button Demo
        </Link>
      </div>

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
