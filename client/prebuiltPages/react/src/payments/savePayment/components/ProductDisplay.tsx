interface ProductItem {
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

interface ProductDisplayProps {
  products: ProductItem[];
  onQuantityChange: (id: number, quantity: number) => void;
}

const ProductDisplay = ({
  products,
  onQuantityChange,
}: ProductDisplayProps) => {
  const total =
    products?.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0,
    ) ?? 0;
  const totalItems =
    products?.reduce((sum, product) => sum + product.quantity, 0) ?? 0;

  return (
    <>
      <div className="product-header">
        <h1 className="product-title">⚽️ Sports Ball Collection</h1>
      </div>

      <div className="product-images-grid">
        {!products || products.length === 0 ? (
          <div>No products available</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="product-image-container">
              <img
                src={product.image.src}
                alt={product.image.alt}
                className="product-image"
                data-testid={`product-image-${product.id}`}
              />
              <h3 className="product-name">
                {product.icon} {product.name}
              </h3>
              <p className="image-price">${product.price.toFixed(2)}</p>

              <div className="quantity-selector">
                <label htmlFor={`quantity-${product.id}`}>Qty:</label>
                <select
                  id={`quantity-${product.id}`}
                  value={product.quantity}
                  onChange={(e) =>
                    onQuantityChange(product.id, Number(e.target.value))
                  }
                  className="quantity-dropdown"
                >
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="checkout-summary">
        <p>
          Total: ${total.toFixed(2)} ({totalItems}{" "}
          {totalItems === 1 ? "item" : "items"})
        </p>
        <p>Taxes, discounts and shipping calculated at checkout</p>
      </div>
    </>
  );
};

export default ProductDisplay;
