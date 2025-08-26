async function startCheckout(checkoutButton, paypalCheckout) {
    try {
      const startOptions = {
        targetElement: checkoutButton,
        presentationMode: "auto",
      };
      await paypalCheckout.start(startOptions, createOrder());
    } catch (error) {
        console.error(error);
    }
}

async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-guest-payments"],
    });

    const eligiblePaymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "USD",
    });

    const paypalCheckout =
      await sdkInstance.createPayPalGuestOneTimePaymentSession({
        onApprove,
        onCancel,
        onComplete,
        onError,
      });

    const checkoutButton = document.getElementById("paypal-basic-card-button");

    // start checkout immediately on load
    startCheckout(checkoutButton, paypalCheckout);

    // also setup the button to start checkout on click
    setupBcdcButton(checkoutButton, paypalCheckout);
  } catch (error) {
    console.error(error);
  }
}

async function setupBcdcButton(checkoutButton, paypalCheckout) {
  checkoutButton.addEventListener("click", onClick);

  async function onClick() {
    startCheckout(checkoutButton, paypalCheckout);
  }
}

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
