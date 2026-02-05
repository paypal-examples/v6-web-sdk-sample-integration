import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ProductDisplay from "../components/ProductDisplay";
import type { ProductItem, ProductPrice } from "../types";
import { PRODUCT_DATA } from "../constants/products";
import { fetchProducts } from "../utils";
import "../styles/Product.css";

interface ProductPageProps {
  flowType: "one-time-payment" | "save-payment" | "subscription";
}

const BaseProduct = ({ flowType }: ProductPageProps) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

        const savedCart = sessionStorage.getItem("cart");
        if (savedCart) {
          const cartItems: ProductItem[] = JSON.parse(savedCart);
          productsWithPricing.forEach((product) => {
            const cartItem = cartItems.find((item) => item.sku === product.sku);
            if (cartItem) {
              product.quantity = cartItem.quantity;
            }
          });
        }

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
