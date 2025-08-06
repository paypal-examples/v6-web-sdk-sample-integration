/**
 * Initializes the PayPal Web SDK, creates a PayPal Payments instance,
 * and sets up the PayPal button or resumes the payment session if returning from redirect.
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
    const paypalPaymentSession = sdkInstance.createPayPalOneTimePaymentSession(
      paymentSessionOptions,
    );

    if (paypalPaymentSession.hasReturned()) {
      await paypalPaymentSession.resume();
    } else {
      setupPayPalButton(paypalPaymentSession);
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
 * Sets up the PayPal button, handles click events, and manages redirect flow.
 * @async
 * @function
 * @param {Object} paypalPaymentSession - The PayPal payment session instance.
 * @returns {Promise<void>}
 */
async function setupPayPalButton(paypalPaymentSession) {
  const enableAutoRedirect = document.querySelector("#enable-auto-redirect");
  const paypalButton = document.querySelector("#paypal-button");
  paypalButton.removeAttribute("hidden");

  paypalButton.addEventListener("click", async () => {
    const createOrderPromiseReference = createRedirectOrder();

    try {
      const { redirectURL } = await paypalPaymentSession.start(
        {
          presentationMode: "redirect",
          autoRedirect: {
            enabled: enableAutoRedirect.checked,
          },
        },
        createOrderPromiseReference,
      );
      if (redirectURL) {
        console.log(`redirectURL: ${redirectURL}`);
        window.location.assign(redirectURL);
      }
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
 * Creates a PayPal order for redirect flow by sending a request to the server.
 * @async
 * @function
 * @returns {Promise<Object>} The created order object containing the order ID.
 */
async function createRedirectOrder() {
  const orderPayload = {
    intent: "CAPTURE",
    paymentSource: {
      paypal: {
        experienceContext: {
          shippingPreference: "NO_SHIPPING",
          userAction: "CONTINUE",
          returnUrl: window.location.href,
          cancelUrl: window.location.href,
        },
      },
    },
    purchaseUnits: [
      {
        amount: {
          currencyCode: "USD",
          value: "10.00",
          breakdown: {
            itemTotal: {
              currencyCode: "USD",
              value: "10.00",
            },
          },
        },
      },
    ],
  };

  const response = await fetch("/paypal-api/checkout/orders/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderPayload),
  });
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
