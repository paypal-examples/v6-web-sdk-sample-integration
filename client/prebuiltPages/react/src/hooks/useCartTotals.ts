import { useMemo } from "react";
import type { ProductItem } from "../types";

interface CartTotals {
  totalItems: number;
  total: number;
  allPricesLoaded: boolean;
}

export const useCartTotals = (items: ProductItem[]): CartTotals => {
  return useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const total = items.reduce((sum, item) => {
      if (item.price !== undefined) {
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);

    const allPricesLoaded = items.every((item) => item.price !== undefined);

    return { totalItems, total, allPricesLoaded };
  }, [items]);
};
