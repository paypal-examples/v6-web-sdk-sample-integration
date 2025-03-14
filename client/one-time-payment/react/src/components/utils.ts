const paymentSessionOptions = {
  async onApprove(data) {
    console.log("onApprove", data);
    const orderData = await captureOrder({
      orderId: data.orderId,
    });
    console.log("Capture result", orderData);
  },
  onCancel(data) {
    console.log("onCancel", data);
  },
  onError(error) {
    console.log("onError", error);
  },
};

export const initPayPalButton = async (
  setIsEligible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  let clientToken;
  try {
    clientToken = await getClientToken();

    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-payments"],
      pageType: "checkout",
    });

    // check if they're eligible first
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currency: "USD",
    });

    if (paymentMethods.isEligible("paypal")) {
      // use state to reveal the button
      setIsEligible(true);
      const paypalCheckout = sdkInstance.createPayPalOneTimePaymentSession(
        paymentSessionOptions
      );

      // the onClick contains the .start
      const onClick = async () => {
        try {
          await paypalCheckout.start({ paymentFlow: "auto" }, createOrder());
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

const getClientToken = async () => {
  {
    const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { access_token } = await response.json();

    return access_token;
  }
}

const createOrder = async () => {
  const response = await fetch(
    "/paypal-api/checkout/orders/create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const orderData = await response.json();
  return { orderId: orderData.id };
};

const captureOrder = async ({ orderId }: { orderId: string }) => {
  const response = await fetch(
    `/paypal-api/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.json();

  return data;
}