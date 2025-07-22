/**
 * Initializes the PayPal Web SDK, creates a PayPal Payments instance,
 * and sets up the PayPal button.
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

    setupPayPalButton(sdkInstance);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Sets up the PayPal button, handles payment session events,
 * and manages presentation modes for the payment flow.
 * @async
 * @function
 * @param {Object} sdkInstance - The PayPal SDK instance.
 * @returns {Promise<void>}
 */
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

    const presentationModesToTry = [
      {
        presentationMode: "payment-handler",
        recoverableErrorCode: "ERR_FLOW_PAYMENT_HANDLER_BROWSER_INCOMPATIBLE",
      },
      {
        presentationMode: "popup",
        recoverableErrorCode: "ERR_DEV_UNABLE_TO_OPEN_POPUP",
      },
      {
        presentationMode: "modal",
      },
    ];

    for (const {
      presentationMode,
      recoverableErrorCode,
    } of presentationModesToTry) {
      try {
        await paypalPaymentSession.start(
          { presentationMode },
          createOrderPromiseReference,
        );
        // exit early when start() successfully resolves
        break;
      } catch (error) {
        // try another presentationMode for a recoverable error
        if (error.code === recoverableErrorCode) {
          continue;
        }
        throw error;
      }
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
