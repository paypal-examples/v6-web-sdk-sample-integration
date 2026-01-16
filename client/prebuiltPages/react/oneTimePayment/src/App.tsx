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
  const [clientToken, setClientToken] = useState<string | undefined>(
    undefined,
  );

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
        components={
          [
            "paypal-payments",
            "venmo-payments",
            "paypal-guest-payments",
          ] as never
        }
        pageType="checkout"
        eligibleMethodsResponse={{
          eligible_methods: {
            paypal: {
              eligible_in_paypal_network: true,
              recommended: true,
            },
            paypal_pay_later: {
              eligible_in_paypal_network: true,
              country_code: "US",
              product_code: "PAYLATER",
            },
          },
          supplementary_data: {
            buyer_country_code: "US",
          },
        }}
      >
        {/* Only payment-related components wait for SDK to initialize */}
        <SoccerBall />
      </PayPalProvider>
    </ErrorBoundary>
  );
}

export default App;
