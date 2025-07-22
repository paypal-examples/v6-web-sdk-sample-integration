/**
 * Initializes the PayPal Web SDK, determines eligible payment methods,
 * and sets up the appropriate payment buttons.
 * @async
 * @function
 * @returns {Promise<void>}
 */
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

/**
 * Options object for PayPal payment session event handlers.
 * @typedef {Object} PaymentSessionOptions
 * @property {function(Object): Promise<void>} onApprove - Called when the payment is approved.
 * @property {function(Object): void} onCancel - Called when the payment is cancelled.
 * @property {function(Error): void} onError - Called when an error occurs.
 */
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

/**
 * Sets up the PayPal button and handles payment session events.
 * @async
 * @function
 * @param {Object} sdkInstance - The PayPal SDK instance.
 * @returns {Promise<void>}
 */
async function setupPayPalButton(sdkInstance) {
  const paypalPaymentSession = sdkInstance.createPayPalOneTimePaymentSession(
    paymentSessionOptions,
  );

  const paypalButton = document.querySelector("#paypal-button");
  paypalButton.removeAttribute("hidden");

  paypalButton.addEventListener("click", async () => {
    try {
      await paypalPaymentSession.start(
        { presentationMode: "auto" },
        createOrder(),
      );
    } catch (error) {
      console.error(error);
    }
  });
}

/**
 * Sets up the Pay Later button and handles payment session events.
 * @async
 * @function
 * @param {Object} sdkInstance - The PayPal SDK instance.
 * @param {Object} paylaterPaymentMethodDetails - The Pay Later payment method details.
 * @returns {Promise<void>}
 */
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
      await paylaterPaymentSession.start(
        { presentationMode: "auto" },
        createOrder(),
      );
    } catch (error) {
      console.error(error);
    }
  });
}

/**
 * Sets up the PayPal Credit button and handles payment session events.
 * @async
 * @function
 * @param {Object} sdkInstance - The PayPal SDK instance.
 * @param {Object} paypalCreditPaymentMethodDetails - The PayPal Credit payment method details.
 * @returns {Promise<void>}
 */
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
      await paypalCreditPaymentSession.start(
        { presentationMode: "auto" },
        createOrder(),
      );
    } catch (error) {
      console.error(error);
    }
  });
}

/**
 * Fetches a browser-safe client token from the server for PayPal SDK initialization.
 * @async
 * @function
 * @returns {Promise<string>} The browser-safe client access token.
 */
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

/**
 * Creates a PayPal order by sending a request to the server.
 * @async
 * @function
 * @returns {Promise<Object>} The created order object containing the order ID.
 */
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

/**
 * Captures a PayPal order by order ID.
 * @async
 * @function
 * @param {Object} params - The parameters object.
 * @param {string} params.orderId - The PayPal order ID.
 * @returns {Promise<Object>} The capture order response data.
 */
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
