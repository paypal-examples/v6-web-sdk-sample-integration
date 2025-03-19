import { useEffect, useState } from "react";
import PayPalButton from "./components/PayPalButton";
import VenmoButton from "./components/VenmoButton";
import { PayPalSDKProvider } from "./context/sdkContext";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";
import { SuccessPage } from "./pages/successPage";
import { FailurePage } from "./pages/failurePage";

function refreshPage() {
  window.location.reload();
}

function ErrorFallback({ error }) {
  const { resetBoundary } = useErrorBoundary();

  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <button
        onClick={() => {
          resetBoundary();
          refreshPage();
        }}
      >
        Try again
      </button>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState<string | null>(
    window.location.pathname
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (currentPage === "/success") {
    return <SuccessPage />;
  }
  if (currentPage === "/failure") {
    return <FailurePage />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PayPalSDKProvider>
        <h1>React One-Time Payment Recommended Integration</h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}
            >
              <h1>⚽️ World Cup Ball</h1>
              <h3 style={{ marginLeft: "24px" }}>Price: 29.99</h3>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}
            >
              <p>Estimated Total: 29.99</p>
              <p>Taxes, discounts and shipping calculated at checkout</p>
            </div>
          </div>
          <PayPalButton />
          <VenmoButton />
        </div>
      </PayPalSDKProvider>
    </ErrorBoundary>
  );
}

export default App;
