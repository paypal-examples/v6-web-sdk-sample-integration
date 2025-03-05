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

async function captureOrder({ orderId, headers }) {
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

async function onApprove(data) {
  console.log("onApprove", data);
  const orderData = await captureOrder({
    orderId: data.orderId,
  });
  console.log("Capture result", orderData);
}

function onCancel(data) {
  console.log("onCancel", data);
}

function onError(data) {
  console.log("onError", data);
}

async function onLoad() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-payments"],
    });
    const paypalOneTimePaymentSession =
      sdkInstance.createPayPalOneTimePaymentSession({
        onApprove,
        onCancel,
        onError,
      });

    async function onClick() {
      try {
        await paypalOneTimePaymentSession.start(
          {
            presentationMode: "payment-handler",
          },
          createOrder(),
        );
      } catch (e) {
        console.error(e);
      }
    }
    const paypalButton = document.querySelector("#paypal-button");
    paypalButton.addEventListener("click", onClick);
  } catch (e) {
    console.error(e);
  }
}
