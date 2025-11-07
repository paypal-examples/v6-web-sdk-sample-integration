async function onPayPalWebSdkLoaded() {
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
    // get the promise reference by invoking createOrder()
    // do not await this async function since it can cause transient activation issues
    const createOrderPromise = createOrder();
    const presentationModesToTry = ["payment-handler", "popup", "modal"];

    for (const presentationMode of presentationModesToTry) {
      try {
        await paypalPaymentSession.start(
          { presentationMode },
          createOrderPromise,
        );
        // exit early when start() successfully resolves
        break;
      } catch (error) {
        // try another presentationMode for a recoverable error
        if (error.isRecoverable) {
          continue;
        }
        throw error;
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
  const { accessToken } = await response.json();

  return accessToken;
}

async function createOrder() {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-with-sample-data",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const { id } = await response.json();

  return { orderId: id };
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
