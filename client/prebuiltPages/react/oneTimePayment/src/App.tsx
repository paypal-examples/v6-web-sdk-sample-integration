import { useEffect, useState } from "react";

import { PayPalProvider } from "@paypal/react-paypal-js/sdk-v6";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";

import { getBrowserSafeClientToken } from "./utils";
import SoccerBall from "./sections/SoccerBall";

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
  const [clientToken, setClientToken] = useState<string>("");

  useEffect(() => {
    const getClientToken = async () => {
      const clientToken = await getBrowserSafeClientToken();
      setClientToken(clientToken);
    };

    getClientToken();
  }, []);

  // Wait for clientToken to be loaded before rendering
  if (!clientToken) {
    return <div>Loading PayPal SDK...</div>;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PayPalProvider
        clientToken={clientToken}
        components={
          [
            "paypal-payments",
            "venmo-payments",
            "paypal-guest-payments",
          ] as never
        }
        pageType="checkout"
        eligibleMethodsPayload={{
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: "100.00",
              },
            },
          ],
        }}
      >
        <h1>React One-Time Payment Recommended Integration</h1>
        <SoccerBall />
      </PayPalProvider>
    </ErrorBoundary>
  );
}

export default App;
