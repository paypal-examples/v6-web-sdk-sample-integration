import React from "react";

export const SuccessPage: React.FC = () => {
  return (
    <>
      <h1>Congratulations your purchase was completed!</h1>
      <button type="button" onClick={() => window.location.replace("/")} >Return to Checkout</button>
    </>
  );
};
