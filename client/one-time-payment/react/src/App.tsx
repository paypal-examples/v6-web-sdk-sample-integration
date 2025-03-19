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
  console.log("error: ", error);
  const { resetBoundary } = useErrorBoundary();

  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <button onClick={() => {
        resetBoundary();
        refreshPage();
      }}>Try again</button>
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
          }}
        >
          <PayPalButton />
          <VenmoButton />
        </div>
      </PayPalSDKProvider>
    </ErrorBoundary>
  );
}

export default App;
