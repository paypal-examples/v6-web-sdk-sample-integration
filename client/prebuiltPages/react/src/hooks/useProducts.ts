import { useState, useEffect } from "react";
import type { ProductItem, ProductPrice } from "../types";
import { PRODUCT_DATA } from "../constants/products";
import { fetchProducts } from "../utils";

interface UseProductsOptions {
  restoreFromCart?: boolean;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        if (options.restoreFromCart) {
          const savedCart = sessionStorage.getItem("cart");
          if (savedCart) {
            const cartItems: ProductItem[] = JSON.parse(savedCart);
            productsWithPricing.forEach((product) => {
              const cartItem = cartItems.find(
                (item) => item.sku === product.sku,
              );
              if (cartItem) {
                product.quantity = cartItem.quantity;
              }
            });
          }
        }

        setProducts(productsWithPricing);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [options.restoreFromCart]);

  return { products, setProducts, loading, error };
};
