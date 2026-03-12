import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayPal Checkout — Next.js",
  description:
    "PayPal one-time payment integration with Next.js and react-paypal-js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
