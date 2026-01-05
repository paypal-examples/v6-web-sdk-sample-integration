async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-payments"],
      pageType: "checkout",
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "USD",
    });

    if (paymentMethods.isEligible("paypal")) {
      setupPayPalButton(sdkInstance);
    }

    if (paymentMethods.isEligible("paylater")) {
      const paylaterPaymentMethodDetails =
        paymentMethods.getDetails("paylater");
      setupPayLaterButton(sdkInstance, paylaterPaymentMethodDetails);
    }

    if (paymentMethods.isEligible("credit")) {
      const paypalCreditPaymentMethodDetails =
        paymentMethods.getDetails("credit");
      setupPayPalCreditButton(sdkInstance, paypalCreditPaymentMethodDetails);
    }
  } catch (error) {
    console.error(error);
  }
}

const paymentSessionOptions = {
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
    renderAlert({ type: "warning", message: "onCancel() callback called" });
    console.log("onCancel", data);
  },
  onError(error) {
    renderAlert({
      type: "danger",
      message: `onError() callback called: ${error}`,
    });
    console.log("onError", error);
  },
};

async function setupPayPalButton(sdkInstance) {
  const paypalPaymentSession = sdkInstance.createPayPalOneTimePaymentSession(
    paymentSessionOptions,
  );

  const paypalButton = document.querySelector("#paypal-button");
  paypalButton.removeAttribute("hidden");

  paypalButton.addEventListener("click", async () => {
    try {
      // get the promise reference by invoking createOrder()
      // do not await this async function since it can cause transient activation issues
      const createOrderPromise = createOrder();
      await paypalPaymentSession.start(
        { presentationMode: "auto" },
        createOrderPromise,
      );
    } catch (error) {
      console.error(error);
    }
  });
}

async function setupPayLaterButton(sdkInstance, paylaterPaymentMethodDetails) {
  const paylaterPaymentSession =
    sdkInstance.createPayLaterOneTimePaymentSession(paymentSessionOptions);

  const { productCode, countryCode } = paylaterPaymentMethodDetails;
  const paylaterButton = document.querySelector("#paylater-button");

  paylaterButton.productCode = productCode;
  paylaterButton.countryCode = countryCode;
  paylaterButton.removeAttribute("hidden");

  paylaterButton.addEventListener("click", async () => {
    try {
      // get the promise reference by invoking createOrder()
      // do not await this async function since it can cause transient activation issues
      const createOrderPromise = createOrder();
      await paylaterPaymentSession.start(
        { presentationMode: "auto" },
        createOrderPromise,
      );
    } catch (error) {
      console.error(error);
    }
  });
}

async function setupPayPalCreditButton(
  sdkInstance,
  paypalCreditPaymentMethodDetails,
) {
  const paypalCreditPaymentSession =
    sdkInstance.createPayPalCreditOneTimePaymentSession(paymentSessionOptions);

  const { countryCode } = paypalCreditPaymentMethodDetails;
  const paypalCreditButton = document.querySelector("#paypal-credit-button");

  paypalCreditButton.countryCode = countryCode;
  paypalCreditButton.removeAttribute("hidden");

  paypalCreditButton.addEventListener("click", async () => {
    try {
      // get the promise reference by invoking createOrder()
      // do not await this async function since it can cause transient activation issues
      const createOrderPromise = createOrder();
      await paypalCreditPaymentSession.start(
        { presentationMode: "auto" },
        createOrderPromise,
      );
    } catch (error) {
      console.error(error);
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
  const alertComponentElement = document.querySelector("alert-component");
  if (!alertComponentElement) {
    return;
  }

  alertComponentElement.setAttribute("type", type);
  alertComponentElement.innerText = message;
}
