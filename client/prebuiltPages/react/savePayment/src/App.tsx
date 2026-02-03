import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import { PayPalProvider } from "@paypal/react-paypal-js/sdk-v6";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";

import { getBrowserSafeClientToken } from "./utils";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ErrorBoundaryTestPage from "./pages/ErrorBoundaryTestPage";
import SinglePageDemo from "./pages/SinglePageDemo";

function ErrorFallback({ error }: { error: Error }) {
  const { resetBoundary } = useErrorBoundary();

  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <button
        onClick={() => {
          resetBoundary();
        }}
      >
        Try again
      </button>
    </div>
  );
}

function Navigation() {
  return (
    <nav
      style={{
        padding: "20px",
        background: "#f8f9fa",
        borderBottom: "2px solid #0070ba",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "#0070ba",
            fontWeight: "bold",
            fontSize: "1.2em",
          }}
        >
          💳 PayPal Save Payment Store
        </Link>
        <Link
          to="/static-buttons"
          style={{
            textDecoration: "none",
            color: "#0070ba",
            fontWeight: "500",
            marginLeft: "auto",
            padding: "8px 16px",
            border: "1px solid #0070ba",
            borderRadius: "4px",
            transition: "all 0.2s",
          }}
        >
          📄 Single Page Demo
        </Link>
        <Link
          to="/error-boundary-test"
          style={{
            textDecoration: "none",
            color: "#d9534f",
            fontWeight: "500",
            padding: "8px 16px",
            border: "1px solid #d9534f",
            borderRadius: "4px",
            transition: "all 0.2s",
          }}
        >
          🛡️ Error Handling Demo
        </Link>
      </div>
    </nav>
  );
}

function App() {
  const [clientToken, setClientToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getClientToken = async () => {
      const clientToken = await getBrowserSafeClientToken();
      setClientToken(clientToken);
    };

    getClientToken();
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PayPalProvider
        clientToken={clientToken}
        components={[
          "paypal-payments",
          "venmo-payments",
          "paypal-guest-payments",
          "paypal-subscriptions",
        ]}
        pageType="checkout"
      >
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/static-buttons" element={<SinglePageDemo />} />
            <Route
              path="/error-boundary-test"
              element={<ErrorBoundaryTestPage />}
            />
          </Routes>
        </BrowserRouter>
      </PayPalProvider>
    </ErrorBoundary>
  );
}

export default App;
