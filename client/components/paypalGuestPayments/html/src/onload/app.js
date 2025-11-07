/**
 * In this example, checkout `start` is in its own function so it can be reused for page load and button click.
 */
async function startGuestPaymentSession(
  checkoutButton,
  paypalGuestPaymentSession,
) {
  try {
    const startOptions = {
      targetElement: checkoutButton,
      presentationMode: "auto",
    };
    const createOrderPromise = createOrder();
    await paypalGuestPaymentSession.start(startOptions, createOrderPromise);
  } catch (error) {
    console.error(error);
  }
}

/**
 * In addition to the typical setup on script load, this function will automatically open the guest checkout form if the buyer
 * is eligible, then setup the guest checkout button as usual.
 */
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

    const paypalGuestPaymentSession =
      await sdkInstance.createPayPalGuestOneTimePaymentSession({
        onApprove,
        onCancel,
        onComplete,
        onError,
      });

    const checkoutButton = document.getElementById("paypal-basic-card-button");

    // start checkout immediately on script load
    startGuestPaymentSession(checkoutButton, paypalGuestPaymentSession);

    // also setup the button to start checkout on click
    setupGuestPaymentButton(checkoutButton, paypalGuestPaymentSession);
  } catch (error) {
    console.error(error);
  }
}

async function setupGuestPaymentButton(
  checkoutButton,
  paypalGuestPaymentSession,
) {
  checkoutButton.addEventListener("click", onClick);

  async function onClick() {
    startGuestPaymentSession(checkoutButton, paypalGuestPaymentSession);
  }
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
