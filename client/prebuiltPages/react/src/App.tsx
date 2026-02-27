import { useEffect, useState } from "react";
import { Routes, Route, Link, HashRouter } from "react-router-dom";
import { PayPalProvider } from "@paypal/react-paypal-js/sdk-v6";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

import { getBrowserSafeClientToken } from "./utils";
import { HomePage } from "./pages/Home";
import BaseProduct from "./pages/BaseProduct";
import BaseCart from "./pages/BaseCart";

// One-Time Payment flow
import OneTimeCheckoutPage from "./paymentFlowCheckoutPages/OneTimePaymentCheckout";

// One-Time Payment with Vault flow
import VaultWithPurchaseCheckoutPage from "./paymentFlowCheckoutPages/VaultWithPurchaseCheckout";

// Save Payment flow
import SavePaymentSettings from "./pages/SavePaymentSettings";

// Subscription flow
import SubscriptionCheckoutPage from "./paymentFlowCheckoutPages/SubscriptionCheckout";

// Error handling demo
import ErrorBoundaryTestPage from "./pages/ErrorBoundary";

// PayPal Messages demo
import PayPalMessagesDemo from "./paypalMessages/PayPalMessagesDemo";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" style={{ padding: "20px", textAlign: "center" }}>
      <p>Something went wrong:</p>
      <pre style={{ color: "red", margin: "20px 0" }}>
        {error instanceof Error ? error.message : String(error)}
      </pre>
      <button
        onClick={resetErrorBoundary}
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
          "paypal-messages",
        ]}
        pageType="checkout"
      >
        <HashRouter>
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
              path="/one-time-payment/error"
              element={<ErrorBoundaryTestPage />}
            />

            {/* One-Time Payment with Vault flow */}
            <Route
              path="/vault-with-purchase"
              element={<BaseProduct flowType="vault-with-purchase" />}
            />
            <Route
              path="/vault-with-purchase/cart"
              element={<BaseCart flowType="vault-with-purchase" />}
            />
            <Route
              path="/vault-with-purchase/checkout"
              element={<VaultWithPurchaseCheckoutPage />}
            />
            <Route
              path="/vault-with-purchase/error"
              element={<ErrorBoundaryTestPage />}
            />

            {/* Save Payment flow */}
            <Route path="/save-payment" element={<SavePaymentSettings />} />

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
              path="/subscription/error"
              element={<ErrorBoundaryTestPage />}
            />

            {/* PayPal Messages demo */}
            <Route path="/paypal-messages" element={<PayPalMessagesDemo />} />

            {/* Error handling demo */}
            <Route
              path="/error-boundary-test"
              element={<ErrorBoundaryTestPage />}
            />
          </Routes>
        </HashRouter>
      </PayPalProvider>
    </ErrorBoundary>
  );
}

export default App;
