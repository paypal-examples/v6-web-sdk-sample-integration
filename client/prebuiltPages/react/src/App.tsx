import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { PayPalProvider } from "@paypal/react-paypal-js/sdk-v6";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";

import { getBrowserSafeClientToken } from "./utils";
import { HomePage } from "./pages/Home";
import BaseProduct from "./pages/BaseProduct";
import BaseCart from "./pages/BaseCart";

// One-Time Payment flow
import OneTimeCheckoutPage from "./payments/oneTimePayment/pages/Checkout";
import OneTimeStaticButtonsDemo from "./payments/oneTimePayment/pages/StaticButtons";

// Save Payment flow
import SavePaymentCheckoutPage from "./payments/savePayment/pages/Checkout";
import SavePaymentStaticButtonsDemo from "./payments/savePayment/pages/StaticButtons";

// Subscription flow
import SubscriptionCheckoutPage from "./payments/subscription/pages/Checkout";
import SubscriptionStaticButtonsDemo from "./payments/subscription/pages/StaticButtons";

// Error handling demo
import ErrorBoundaryTestPage from "./pages/ErrorBoundary";

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
            <Route
              path="/one-time-payment"
              element={<BaseProduct flowType="one-time-payment" />}
            />
            <Route
              path="/one-time-payment/cart"
              element={<BaseCart flowType="one-time-payment" />}
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
            <Route
              path="/save-payment"
              element={<BaseProduct flowType="save-payment" />}
            />
            <Route
              path="/save-payment/cart"
              element={<BaseCart flowType="save-payment" />}
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
            <Route
              path="/subscription"
              element={<BaseProduct flowType="subscription" />}
            />
            <Route
              path="/subscription/cart"
              element={<BaseCart flowType="subscription" />}
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
