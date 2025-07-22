import React from "react";

/**
 * Product interface describing the product details.
 */
interface Product {
  /** The product name. */
  name: string;
  /** The product icon (emoji or string). */
  icon: string;
  /** The product price. */
  price: number;
  /** The image source URL for the product. */
  imageSrc: string;
  /** The alt text for the product image. */
  imageAlt: string;
}

/**
 * Props for the ProductDisplay component.
 */
interface ProductDisplayProps {
  /** The product to display. */
  product: Product;
}

/**
 * ProductDisplay component renders product details, image, and summary.
 *
 * @param {ProductDisplayProps} props - The props for the ProductDisplay component.
 * @returns {JSX.Element} The rendered product display component.
 */
const ProductDisplay: React.FC<ProductDisplayProps> = ({ product }) => {
  return (
    <>
      <div className="product-header">
        <h1 className="product-title">
          {product.icon} {product.name}
        </h1>
        <h3 className="product-price">Price: ${product.price.toFixed(2)}</h3>
      </div>

      <div className="product-image-container">
        <img
          src={product.imageSrc}
          alt={product.imageAlt}
          className="product-image"
          data-testid="product-image"
        />
      </div>

      <div className="checkout-summary">
        <p>Estimated Total: ${product.price.toFixed(2)}</p>
        <p>Taxes, discounts and shipping calculated at checkout</p>
      </div>
    </>
  );
};

export default ProductDisplay;
