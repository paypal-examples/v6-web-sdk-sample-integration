"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCT, saveCart } from "@/lib/product";

const QUANTITY_OPTIONS = [1, 2, 3, 4, 5];

const AddToBag = () => {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const handleAddToBag = () => {
    saveCart({ sku: PRODUCT.sku, quantity });
    router.push("/cart");
  };

  return (
    <>
      {/* Quantity Selector */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <label
          htmlFor="quantity"
          className="text-sm text-[var(--foreground-secondary)]"
        >
          Quantity
        </label>
        <select
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] appearance-none cursor-pointer"
        >
          {QUANTITY_OPTIONS.map((qty) => (
            <option key={qty} value={qty}>
              {qty}
            </option>
          ))}
        </select>
      </div>

      {/* CTA */}
      <button
        onClick={handleAddToBag}
        className="inline-block px-8 py-3 rounded-full bg-[var(--accent)] text-white text-base font-medium hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
      >
        Add to Bag
      </button>
    </>
  );
};

export default AddToBag;
