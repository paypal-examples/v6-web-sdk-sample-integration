import { useEffect, useState } from "react";
import {
  CreateInstanceOptions,
  PayPalSdkInstanceProvider,
} from "@paypal/react-paypal-js/sdk-v6";
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

  const createInstanceOptions: CreateInstanceOptions<
    ["paypal-payments", "venmo-payments"]
  > = {
    clientToken,
    components: ["paypal-payments", "venmo-payments"],
    pageType: "checkout",
  };

  return clientToken ? (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PayPalSdkInstanceProvider
        createInstanceOptions={createInstanceOptions}
        scriptOptions={{ environment: "sandbox" }}
      >
        <h1>React One-Time Payment Recommended Integration</h1>
        <SoccerBall />
      </PayPalSdkInstanceProvider>
    </ErrorBoundary>
  ) : null;
}

export default App;
