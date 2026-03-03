import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayPal Checkout — Next.js",
  description: "PayPal one-time payment integration with Next.js and react-paypal-js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
