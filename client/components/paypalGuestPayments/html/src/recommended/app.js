async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-guest-payments"],
    });

    setupGuestPaymentButton(sdkInstance);
  } catch (error) {
    console.error(error);
  }
}

async function setupGuestPaymentButton(sdkInstance) {
  try {
    const eligiblePaymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "USD",
    });

    const paypalGuestPaymentSession =
      await sdkInstance.createPayPalGuestOneTimePaymentSession({
        onApprove,
        onCancel,
        onWarn,
        onError,
      });

    document
      .getElementById("paypal-basic-card-button")
      .addEventListener("click", onClick);

    async function onClick() {
      try {
        const startOptions = {
          presentationMode: "auto",
        };
        // get the promise reference by invoking createOrder()
        // do not await this async function since it can cause transient activation issues
        const createOrderPromise = createOrder();
        await paypalGuestPaymentSession.start(startOptions, createOrderPromise);
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function onApprove(data) {
  console.log("onApprove", data);
  const orderData = await captureOrder({
    orderId: data.orderId,
  });
  renderAlert({
    type: "success",
    message: `Order successfully captured! ${JSON.stringify(data)}`,
  });
  console.log("Capture result", orderData);
}

function onCancel(data) {
  renderAlert({ type: "warning", message: "onCancel() callback called" });
  console.log("onCancel", data);
}

function onWarn(error) {
  renderAlert({
    type: "warning",
    message: `onWarn() callback called: ${error}`,
  });
  console.log("onWarn", error);
}

function onError(error) {
  renderAlert({
    type: "danger",
    message: `onError() callback called: ${error}`,
  });
  console.log("onError", error);
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
  renderAlert({ type: "info", message: `Order successfully created: ${id}` });

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

function renderAlert({ type, message }) {
  const alertContainer = document.querySelector(".alert-container");
  if (!alertContainer) {
    return;
  }

  // remove existing alert
  const existingAlertComponent =
    alertContainer.querySelector("alert-component");
  existingAlertComponent?.remove();

  const alertComponent = document.createElement("alert-component");
  alertComponent.setAttribute("type", type);

  const alertMessageSlot = document.createElement("span");
  alertMessageSlot.setAttribute("slot", "alert-message");
  alertMessageSlot.innerText = message;

  alertComponent.append(alertMessageSlot);
  alertContainer.append(alertComponent);
}
