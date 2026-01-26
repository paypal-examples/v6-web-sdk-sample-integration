interface Product {
  name: string;
  icon: string;
  price: number;
  imageSrc: string;
  imageAlt: string;
}

interface ProductDisplayProps {
  product: Product;
}

const ProductDisplay = ({ product }: ProductDisplayProps) => {
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
