import AddToBag from "@/components/AddToBag";
import { PRODUCT } from "@/lib/product";

const Home = () => {
  return (
    <main className="flex-1 flex flex-col">
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

          {/* Add to Bag Component */}
          <AddToBag />
        </div>
      </section>
    </main>
  );
};

export default Home;
