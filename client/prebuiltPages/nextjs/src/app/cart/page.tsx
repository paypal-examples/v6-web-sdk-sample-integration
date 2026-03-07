"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import {
  PRODUCT,
  getCart,
  saveCart,
  clearCart,
  type CartItem,
} from "@/lib/product";

const QUANTITY_OPTIONS = [1, 2, 3, 4, 5];

const Cart = () => {
  const [cart, setCart] = useState<CartItem | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = getCart();
    if (!saved) {
      router.replace("/");
      return;
    }
    setCart(saved);
  }, [router]);

  const handleQuantityChange = (quantity: number) => {
    if (!cart) return;
    const updated = { ...cart, quantity };
    saveCart(updated);
    setCart(updated);
  };

  const handleRemove = () => {
    clearCart();
    router.push("/");
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (!cart) return null;

  const subtotal = (parseFloat(PRODUCT.price) * cart.quantity).toFixed(2);

  return (
    <main className="min-h-screen flex flex-col">
      <Nav />

      <section className="flex-1 flex flex-col items-center px-6 py-16">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] mb-10">
            Your Bag
          </h1>

          {/* Cart Item */}
          <div className="flex gap-6 py-8 border-t border-[var(--border)]">
            {/* Product Visual */}
            <div className="w-24 h-24 rounded-2xl bg-[var(--background-secondary)] flex items-center justify-center shrink-0">
              <span className="text-4xl">⚽</span>
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-medium text-[var(--foreground)]">
                    {PRODUCT.name}
                  </h2>
                  <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                    {PRODUCT.tagline}
                  </p>
                </div>
                <p className="text-base font-medium text-[var(--foreground)] whitespace-nowrap">
                  ${PRODUCT.price}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="cart-quantity"
                    className="text-sm text-[var(--foreground-secondary)]"
                  >
                    Qty
                  </label>
                  <select
                    id="cart-quantity"
                    value={cart.quantity}
                    onChange={(e) =>
                      handleQuantityChange(Number(e.target.value))
                    }
                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] appearance-none cursor-pointer"
                  >
                    {QUANTITY_OPTIONS.map((qty) => (
                      <option key={qty} value={qty}>
                        {qty}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleRemove}
                  className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-[var(--border)] pt-6 mt-2">
            <div className="flex items-center justify-between mb-8">
              <span className="text-base text-[var(--foreground)]">
                Subtotal
              </span>
              <span className="text-base font-medium text-[var(--foreground)]">
                ${subtotal}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-full bg-[var(--accent)] text-white text-base font-medium hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
            >
              Check Out
            </button>
          </div>
        </div>
      </section>

      <footer className="w-full px-6 py-6 border-t border-[var(--border)] text-center">
        <p className="text-xs text-[var(--foreground-secondary)]">
          Powered by PayPal &middot; Built with Next.js
        </p>
      </footer>
    </main>
  );
};

export default Cart;
