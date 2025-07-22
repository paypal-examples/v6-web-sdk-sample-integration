/**
 * Class to manage the page state, specifically the PayPal payment session.
 */
class PageState {
  /**
   * Internal state object.
   * @type {{paymentSession: Object|null}}
   */
  state = {
    paymentSession: null,
  };

  /**
   * Gets the current PayPal payment session.
   * @returns {Object|null}
   */
  get paymentSession() {
    return this.state.paymentSession;
  }

  /**
   * Sets the PayPal payment session.
   * @param {Object} value - The PayPal payment session instance.
   */
  set paymentSession(value) {
    this.state.paymentSession = value;
  }
}

const pageState = new PageState();

/**
 * Retrieves the parent window's origin from the URL query parameters.
 * @function
 * @returns {string|null} The parent origin.
 */
function getParentOrigin() {
  const parentOrigin = new URLSearchParams(window.location.search).get(
    "origin",
  );
  return parentOrigin;
}

/**
 * Sets up a window message event listener to handle postMessage events
 * from the parent window, updating state and handling payment flow events.
 * @function
 * @returns {void}
 */
function setupPostMessageListener() {
  window.addEventListener("message", (event) => {
    // It's very important to check that the `origin` is expected to prevent XSS attacks!
    if (event.origin !== getParentOrigin()) {
      return;
    }

    const { eventName } = event.data;

    const statusContainer = document.querySelector("#postMessageStatus");
    statusContainer.innerHTML = JSON.stringify(event.data);

    if (eventName === "close-payment-window") {
      pageState.paymentSession?.cancel();
    }
  });
}

/**
 * Sends a postMessage to the parent window with the given payload.
 * @function
 * @param {Object} payload - The message payload to send.
 */
function sendPostMessageToParent(payload) {
  window.parent.postMessage(payload, getParentOrigin());
}

/**
 * Gets the selected presentation mode from the radio inputs.
 * @function
 * @returns {string} The selected presentation mode value.
 */
function getSelectedPresentationMode() {
  return document.querySelector("input[name='presentationMode']:checked").value;
}

/**
 * Sets up event listeners for presentation mode radio buttons and
 * notifies the parent window of the selected mode.
 * @function
 * @returns {void}
 */
function setupPresentationModeRadio() {
  const selector = document.querySelectorAll("input[name='presentationMode']");
  Array.from(selector).forEach((element) => {
    element.addEventListener("change", (event) => {
      const { target } = event;
      if (target.checked) {
        sendPostMessageToParent({
          eventName: "presentationMode-changed",
          data: { presentationMode: target.value },
        });
      }
    });

    if (element.checked) {
      sendPostMessageToParent({
        eventName: "presentationMode-changed",
        data: { presentationMode: element.value },
      });
    }
  });
}

/**
 * Displays the iframe's origin in the DOM.
 * @function
 * @returns {void}
 */
function setupIframeOriginDisplay() {
  const origin = window.location.origin;
  document.querySelector("#iframeDomain").innerHTML = origin;
}

/**
 * Sets up the PayPal button, creates a payment session, and handles payment events.
 * @async
 * @function
 * @param {Object} sdkInstance - The PayPal SDK instance.
 * @returns {Promise<void>}
 */
async function setupPayPalButton(sdkInstance) {
  pageState.paymentSession = sdkInstance.createPayPalOneTimePaymentSession({
    /**
     * Called when the payment is approved.
     * @param {Object} data - The approval data.
     */
    onApprove: async (data) => {
      const orderData = await captureOrder({
        orderId: data.orderId,
      });

      sendPostMessageToParent({
        eventName: "payment-flow-approved",
        data: orderData,
      });
    },
    /**
     * Called when the payment is canceled.
     * @param {Object} data - The cancellation data.
     */
    onCancel: (data) => {
      sendPostMessageToParent({
        eventName: "payment-flow-canceled",
        data: {
          orderId: data?.orderId,
        },
      });
    },
    /**
     * Called when an error occurs during payment.
     * @param {Object} data - The error data.
     */
    onError: (data) => {
      sendPostMessageToParent({
        eventName: "payment-flow-canceled",
        data: {
          orderId: data?.orderId,
        },
      });
    },
  });

  const paypalButton = document.querySelector("#paypal-button");
  paypalButton.addEventListener("click", async () => {
    const paymentFlowConfig = {
      presentationMode: getSelectedPresentationMode(),
      fullPageOverlay: { enabled: false },
    };

    sendPostMessageToParent({
      eventName: "payment-flow-start",
      data: { paymentFlowConfig },
    });

    try {
      await pageState.paymentSession.start(paymentFlowConfig, createOrder());
    } catch (e) {
      console.error(e);
    }
  });
}

/**
 * Initializes the iframe integration, sets up event listeners, and loads the PayPal SDK.
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function onPayPalWebSdkLoaded() {
  if (window.setupComplete) {
    return;
  }

  setupPresentationModeRadio();
  setupIframeOriginDisplay();
  setupPostMessageListener();

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

  window.setupComplete = true;
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
