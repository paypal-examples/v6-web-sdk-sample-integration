import { useCallback } from "react";
import type { ProductItem } from "../types";

export const useQuantityChange = (
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>,
) => {
  const handleQuantityChange = useCallback(
    (id: number, quantity: number) => {
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === id ? { ...product, quantity } : product,
        ),
      );
    },
    [setProducts],
  );

  return handleQuantityChange;
};
