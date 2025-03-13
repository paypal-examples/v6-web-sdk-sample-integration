import React, { useEffect } from "react";

const PayPalButton = () => {
  // in useEffect
  // load the script
  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        if (!(window as any).paypal) {
          const script = document.createElement("script");
          script.src = "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = () => initPayPal();
          document.body.appendChild(script);
        } else {
          await initPayPal();
        }
      } catch (e) {
        console.error("Failed to load PayPal SDK", e);
      }
    };

    loadPayPalSDK();
  }, []);

  const initPayPal = async () => {
    let clientToken;
    try {
      clientToken = await fetch("/paypal-api/auth/browser-safe-client-token")
        .then((res) => res.json())
        .then((data) => data.access_token);

      const sdkInstance = await (window as any).paypal.createInstance({
        clientToken,
        components: ["paypal-payments"],
        pageType: "checkout",
      });

      // check if they're eligible first
      const paymentMethods = await sdkInstance.findEligibleMethods({
        currency: "USD",
      });

      if (paymentMethods.isEligible("paypal")) {
        const paypalCheckout = sdkInstance.createPayPalOneTimePaymentSession({
          onApprove: async (data) => {
            console.log("onApprove: ", data);
            // do the captureOrder here
          },
          onCancel: (data) => {
            console.log("onCancel: ", data);
          },
          onError: (data) => {
            console.log("onError: ", data);
          },
        });

        // the onClick contains the .start
        const onClick = async () => {
          try {
            const checkoutOptionsPromise = await fetch(
              "/paypal-api/checkout-options"
            );
            await paypalCheckout.start(
              { paymentFlow: "auto" },
              checkoutOptionsPromise
            );
          } catch (e) {
            console.error(e);
          }
        };

        const paypalButton = document.getElementById("paypal-button");

        if (paypalButton) {
          paypalButton.addEventListener("click", onClick);
        }
      }
    } catch (e) {
      console.error("Failed to intialize PayPal Button", e);
    }
  };

  return <paypal-button id="paypal-button"></paypal-button>;
};

export default PayPalButton;
