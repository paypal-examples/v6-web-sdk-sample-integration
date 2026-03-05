"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { PRODUCT, saveCart } from "@/lib/product";

const QUANTITY_OPTIONS = [1, 2, 3, 4, 5];

const Home = () => {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const handleAddToBag = () => {
    saveCart({ sku: PRODUCT.sku, quantity });
    router.push("/cart");
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Nav />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-2xl w-full text-center">
          {/* Product Visual */}
          <div className="w-48 h-48 mx-auto mb-12 rounded-full bg-[var(--background-secondary)] flex items-center justify-center">
            <span className="text-7xl">⚽</span>
          </div>

          {/* Product Info */}
          <p className="text-sm font-medium tracking-widest uppercase text-[var(--accent)] mb-3">
            New
          </p>
          <h1 className="text-5xl font-semibold tracking-tight text-[var(--foreground)] mb-4">
            {PRODUCT.name}
          </h1>
          <p className="text-2xl font-light text-[var(--foreground-secondary)] mb-6">
            {PRODUCT.tagline}
          </p>
          <p className="text-base leading-relaxed text-[var(--foreground-secondary)] max-w-lg mx-auto mb-10">
            {PRODUCT.description}
          </p>

          {/* Price */}
          <p className="text-3xl font-medium text-[var(--foreground)] mb-8">
            ${PRODUCT.price}
          </p>

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
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-6 border-t border-[var(--border)] text-center">
        <p className="text-xs text-[var(--foreground-secondary)]">
          Powered by PayPal &middot; Built with Next.js
        </p>
      </footer>
    </main>
  );
};

export default Home;
