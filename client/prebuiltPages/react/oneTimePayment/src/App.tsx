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
  const [locale, setLocale] = useState<string>("en-US");

  useEffect(() => {
    const getClientToken = async () => {
      const clientToken = await getBrowserSafeClientToken();
      setClientToken(clientToken);
    };

    getClientToken();
  }, []);

  return clientToken ? (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div>
        <label htmlFor="locale-select">Locale: </label>
        <select
          id="locale-select"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          style={{ marginBottom: "20px" }}
        >
          <option value="en-US">English (US)</option>
          <option value="es-ES">Spanish (Spain)</option>
          <option value="fr-FR">French (France)</option>
          <option value="de-DE">German (Germany)</option>
          <option value="it-IT">Italian (Italy)</option>
          <option value="ja-JP">Japanese (Japan)</option>
          <option value="zh-CN">Chinese (China)</option>
          <option value="pt-BR">Portuguese (Brazil)</option>
        </select>
      </div>
      <PayPalProvider
        components={["paypal-payments", "venmo-payments"]}
        clientToken={clientToken}
        pageType="checkout"
        environment="sandbox"
        locale={locale}
      >
        <h1>React One-Time Payment Recommended Integration</h1>
        <SoccerBall />
      </PayPalProvider>
    </ErrorBoundary>
  ) : null;
}

export default App;
