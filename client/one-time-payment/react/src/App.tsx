import { useEffect, useState } from "react";

import { PayPalSDKProvider } from "./context/sdkContext";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";

import { getBrowserSafeClientToken } from "./utils.ts";
import SoccerBall from "./sections/SoccerBall.tsx";

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
      <PayPalSDKProvider clientToken={clientToken} components={["paypal-payments", "venmo-payments"]} pageType="checkout">
        <h1>React One-Time Payment Recommended Integration</h1>
        <SoccerBall />
      </PayPalSDKProvider>
    </ErrorBoundary>
  );
}

export default App;
