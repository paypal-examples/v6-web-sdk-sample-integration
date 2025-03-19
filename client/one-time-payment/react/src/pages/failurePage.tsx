import React from "react";

export const FailurePage: React.FC = () => {
  return (
    <>
      <h1>Oh no! Something went wrong.</h1>
      <button type="button" onClick={() => window.location.replace("/")} >Return to Checkout</button>
    </>
  );
};
