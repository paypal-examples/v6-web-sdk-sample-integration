async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-guest-payments"],
    });

    setupBcdcButton(sdkInstance);
  } catch (error) {
    console.error(error);
  }
}

async function setupBcdcButton(sdkInstance) {
  try {
    const paypalCheckout =
      await sdkInstance.createPayPalGuestOneTimePaymentSession({
        onApprove,
        onCancel,
        onComplete,
        onError,
        onShippingAddressChange,
        onShippingOptionsChange,
      });

    document
      .getElementById("paypal-basic-card-button")
      .addEventListener("click", onClick);

    async function onClick() {
      try {
        const startOptions = {
          presentationMode: "auto",
        };
        await paypalCheckout.start(startOptions, createOrder());
        } catch (error) {
          console.error(error);
          }
      }
  } catch (error) {
    console.error(error);
  }
}

// TODO fill in shipping callbacks logic

function onApprove(data) {
  console.log("onApprove", data);
  const orderData = await captureOrder({
    orderId: data.orderId,
    });
  console.log("Capture result", orderData);
}

function onCancel(data) {
  console.log("onCancel", data);
}

function onComplete(data) {
  console.log("onComplete", data);
}

function onError(data) {
  console.log("onError", data);
}

function onShippingAddressChange(data) {
  console.log("onShippingAddressChange", data);
}

function onShippingOptionsChange(data) {
  console.log("onShippingOptionsChange", data);
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
