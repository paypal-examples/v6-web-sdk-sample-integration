async function onPayPalLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-payments"],
      pageType: "checkout",
    });

    setupPayPalButton(sdkInstance);
  } catch (error) {
    console.error(error);
  }
}

async function setupPayPalButton(sdkInstance) {
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

  const paypalPaymentSession = sdkInstance.createPayPalOneTimePaymentSession(
    paymentSessionOptions,
  );

  const paypalButton = document.querySelector("#paypal-button");
  paypalButton.removeAttribute("hidden");

  paypalButton.addEventListener("click", async () => {
    const createOrderPromiseReference = createOrder();

    try {
      await paypalPaymentSession.start(
        { presentationMode: "payment-handler" },
        createOrderPromiseReference,
      );
    } catch (error) {
      if (error.code === "ERR_FLOW_PAYMENT_HANDLER_BROWSER_INCOMPATIBLE") {
        try {
          await paypalPaymentSession.start(
            { presentationMode: "popup" },
            createOrderPromiseReference,
          );
        } catch (error) {
          console.error(error);
        }
      } else {
        console.error(error);
      }
    }
  });
}

async function getBrowserSafeClientToken() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { access_token } = await response.json();

  return access_token;
}

async function createOrder() {
  const response = await fetch("/paypal-api/checkout/orders/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const orderData = await response.json();

  return { orderId: orderData.id };
}

async function captureOrder({ orderId }) {
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
