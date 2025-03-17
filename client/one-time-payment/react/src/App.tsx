import PayPalButton from "./components/PayPalButton";
import VenmoButton from "./components/VenmoButton";
import { PayPalSDKProvider } from "./context/sdkContext";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error }) {
  console.log("error: ", error);
  const { resetBoundary } = useErrorBoundary();

  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <button onClick={resetBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <PayPalSDKProvider>
      <h1>React One-Time Payment Recommended Integration</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <PayPalButton />
          <VenmoButton />
        </ErrorBoundary>
      </div>
    </PayPalSDKProvider>
  );
}

export default App;
