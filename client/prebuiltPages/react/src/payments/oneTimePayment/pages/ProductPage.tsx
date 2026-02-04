import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ProductDisplay from "../../../components/ProductDisplay";
import "../../../styles/ProductPage.css";

import soccerBallImage from "../../../images/world-cup.jpg";
import basketballImage from "../../../images/basket-ball.jpeg";
import baseballImage from "../../../images/base-ball.jpeg";
import hockeyPuckImage from "../../../images/hockey-puck.jpeg";

export interface ProductItem {
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

const ProductPage = () => {
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
    if (selectedProducts.length === 0) {
      alert("Please select at least one item");
      return;
    }

    sessionStorage.setItem("cart", JSON.stringify(selectedProducts));
    navigate("/one-time-payment/cart");
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
          to="/one-time-payment/static-demo"
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

export default ProductPage;
