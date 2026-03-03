import Link from "next/link";
import { PRODUCT } from "@/lib/product";

const Home = () => {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-[var(--border)]">
        <span className="text-sm font-medium tracking-tight text-[var(--foreground)]">
          PayPal Store
        </span>
        <span className="text-xs text-[var(--foreground-secondary)]">
          Next.js Demo
        </span>
      </nav>

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

          {/* CTA */}
          <Link
            href="/checkout"
            className="inline-block px-8 py-3 rounded-full bg-[var(--accent)] text-white text-base font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Buy Now
          </Link>
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
