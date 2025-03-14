import React from "react";
import PayPalButton from "./components/PayPalButton";
import VenmoButton from "./components/VenmoButton";

function App() {
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
        <PayPalButton />
        <VenmoButton />
      </div>
    </>
  );
}

export default App;
