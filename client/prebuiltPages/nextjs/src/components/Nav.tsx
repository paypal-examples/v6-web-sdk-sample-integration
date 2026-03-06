import Link from "next/link";

const Nav = () => {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-[var(--border)]">
      <Link
        href="/"
        className="text-sm font-medium tracking-tight text-[var(--foreground)] hover:text-[var(--foreground-secondary)] transition-colors"
      >
        PayPal Store
      </Link>
      <span className="text-xs text-[var(--foreground-secondary)]">
        Next.js Demo
      </span>
    </nav>
  );
};

export default Nav;
