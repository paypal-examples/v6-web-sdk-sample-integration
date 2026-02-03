async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      components: ["bank-ach-payments"],
      pageType: "checkout",
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "USD",
      amount: "100.00",
    });

    if (paymentMethods.isEligible("ach")) {
      setupBankAchButton(sdkInstance);
    } else {
      renderAlert({ type: "warning", message: "Bank ACH is not eligible" });
    }
  } catch (error) {
    console.error(error);
  }
}

async function setupBankAchButton(sdkInstance) {
  const bankAchPaymentSession = sdkInstance.createBankAchOneTimePaymentSession({
    async onApprove(data) {
      console.log("onApprove", data);
      const orderData = await captureOrder({
        orderId: data.orderId,
      });
      renderAlert({
        type: "success",
        message: `Order successfully captured! ${JSON.stringify(data)}`,
      });
      console.log("Capture result", orderData);
    },
    onCancel(data) {
      renderAlert({
        type: "warning",
        message: `onCancel() callback called ${data.orderId ?? ""}`,
      });
      console.log("onCancel", data);
    },
    onError(error) {
      renderAlert({
        type: "danger",
        message: `onError() callback called: ${error.message}`,
      });
      console.log("onError", error);
    },
  });

  const bankAchButton = document.querySelector("#bank-ach-button");
  bankAchButton.removeAttribute("hidden");

  bankAchButton.addEventListener("click", async () => {
    try {
      // get the promise reference by invoking createOrder()
      // do not await this async function since it can cause transient activation issues
      const createOrderPromise = createOrder();
      await bankAchPaymentSession.start(
        { presentationMode: "auto" },
        createOrderPromise,
      );
    } catch (error) {
      renderAlert({
        type: "danger",
        message: `Bank ACH Button click failure: ${error.message}`,
      });
      console.error(error);
    }
  });
}

async function getBrowserSafeClientId() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-id", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { clientId } = await response.json();

  return clientId;
}

async function createOrder() {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-one-time-payment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Order creation failed ${data ? JSON.stringify(data) : ""}`,
    );
  }

  renderAlert({
    type: "info",
    message: `Order successfully created: ${data.id}`,
  });

  return { orderId: data.id };
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

  if (!response.ok) {
    throw new Error(`Order capture failed ${data?.name ?? ""}`);
  }

  return data;
}

function renderAlert({ type, message }) {
  const alertComponentElement = document.querySelector("alert-component");
  if (!alertComponentElement) {
    return;
  }

  alertComponentElement.setAttribute("type", type);
  alertComponentElement.innerText = message;
}
