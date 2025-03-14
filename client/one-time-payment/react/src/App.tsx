import { useState, useEffect } from "react";
import PayPalButton from "./components/PayPalButton";
import VenmoButton from "./components/VenmoButton";

function App() {
  const [isSDKReady, setIsSDKReady] = useState<boolean>(false);

  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        if (!window.paypal) {
          const script = document.createElement("script");
          script.src = "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = () => setIsSDKReady(true);
          document.body.appendChild(script);
        } else {
          setIsSDKReady(true);
        }
      } catch (e) {
        console.error("Failed to load PayPal SDK", e);
      }
    };

    loadPayPalSDK();
  }, []);
  return (
    <>
      <h1>React One-Time Payment Recommended Integration</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {isSDKReady && <PayPalButton />}
        {isSDKReady && <VenmoButton />}
      </div>
    </>
  );
}

export default App;
