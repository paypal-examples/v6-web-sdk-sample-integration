import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { PayPalProvider } from "@paypal/react-paypal-js/sdk-v6";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";

import { getBrowserSafeClientToken } from "./utils";
import { HomePage } from "./pages/HomePage";

// One-Time Payment flow
import OneTimeProductPage from "./payments/oneTimePayment/pages/ProductPage";
import OneTimeCartPage from "./payments/oneTimePayment/pages/CartPage";
import OneTimeCheckoutPage from "./payments/oneTimePayment/pages/CheckoutPage";
import OneTimeStaticButtonsDemo from "./payments/oneTimePayment/pages/StaticButtonsDemo";

// Save Payment flow
import SavePaymentProductPage from "./payments/savePayment/pages/ProductPage";
import SavePaymentCartPage from "./payments/savePayment/pages/CartPage";
import SavePaymentCheckoutPage from "./payments/savePayment/pages/CheckoutPage";
import SavePaymentStaticButtonsDemo from "./payments/savePayment/pages/StaticButtonsDemo";

// Subscription flow
import SubscriptionProductPage from "./payments/subscription/pages/ProductPage";
import SubscriptionCartPage from "./payments/subscription/pages/CartPage";
import SubscriptionCheckoutPage from "./payments/subscription/pages/CheckoutPage";
import SubscriptionStaticButtonsDemo from "./payments/subscription/pages/StaticButtonsDemo";

// Error handling demo
import ErrorBoundaryTestPage from "./pages/ErrorBoundaryTestPage";

function ErrorFallback({ error }: { error: Error }) {
  const { resetBoundary } = useErrorBoundary();

  return (
    <div role="alert" style={{ padding: "20px", textAlign: "center" }}>
      <p>Something went wrong:</p>
      <pre style={{ color: "red", margin: "20px 0" }}>{error.message}</pre>
      <button
        onClick={resetBoundary}
        style={{ padding: "10px 20px", cursor: "pointer" }}
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
          PayPal V6 React Demos
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
            {/* Home page */}
            <Route path="/" element={<HomePage />} />

            {/* One-Time Payment flow */}
            <Route path="/one-time-payment" element={<OneTimeProductPage />} />
            <Route
              path="/one-time-payment/cart"
              element={<OneTimeCartPage />}
            />
            <Route
              path="/one-time-payment/checkout"
              element={<OneTimeCheckoutPage />}
            />
            <Route
              path="/one-time-payment/static-demo"
              element={<OneTimeStaticButtonsDemo />}
            />
            <Route
              path="/one-time-payment/error"
              element={<ErrorBoundaryTestPage />}
            />

            {/* Save Payment flow */}
            <Route path="/save-payment" element={<SavePaymentProductPage />} />
            <Route
              path="/save-payment/cart"
              element={<SavePaymentCartPage />}
            />
            <Route
              path="/save-payment/checkout"
              element={<SavePaymentCheckoutPage />}
            />
            <Route
              path="/save-payment/static-demo"
              element={<SavePaymentStaticButtonsDemo />}
            />
            <Route
              path="/save-payment/error"
              element={<ErrorBoundaryTestPage />}
            />

            {/* Subscription flow */}
            <Route path="/subscription" element={<SubscriptionProductPage />} />
            <Route
              path="/subscription/cart"
              element={<SubscriptionCartPage />}
            />
            <Route
              path="/subscription/checkout"
              element={<SubscriptionCheckoutPage />}
            />
            <Route
              path="/subscription/static-demo"
              element={<SubscriptionStaticButtonsDemo />}
            />
            <Route
              path="/subscription/error"
              element={<ErrorBoundaryTestPage />}
            />

            {/* Error handling demo */}
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
