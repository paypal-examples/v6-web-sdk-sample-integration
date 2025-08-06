/**
 * Initializes the PayPal Web SDK, determines eligible payment methods for saving a payment,
 * and sets up the PayPal button if eligible.
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
      paymentFlow: "VAULT_WITHOUT_PAYMENT",
    });

    if (paymentMethods.isEligible("paypal")) {
      setupPayPalButton(sdkInstance);
    }
  } catch (error) {
    console.error(error);
  }
}

/**
 * Options object for PayPal save payment session event handlers.
 * @typedef {Object} PaymentSessionOptions
 * @property {function(Object): Promise<void>} onApprove - Called when the save payment is approved.
 * @property {function(Object): void} onCancel - Called when the save payment is cancelled.
 * @property {function(Error): void} onError - Called when an error occurs.
 */
const paymentSessionOptions = {
  async onApprove(data) {
    console.log("onApprove", data);
    const createPaymentTokenResponse = await createPaymentToken(
      data.vaultSetupToken,
    );
    console.log("Create payment token response: ", createPaymentTokenResponse);
  },
  onCancel(data) {
    console.log("onCancel", data);
  },
  onError(error) {
    console.log("onError", error);
  },
};

/**
 * Sets up the PayPal button for saving a payment method and handles session events.
 * @async
 * @function
 * @param {Object} sdkInstance - The PayPal SDK instance.
 * @returns {Promise<void>}
 */
async function setupPayPalButton(sdkInstance) {
  const paypalPaymentSession = sdkInstance.createPayPalSavePaymentSession(
    paymentSessionOptions,
  );

  const paypalButton = document.querySelector("#paypal-button");
  paypalButton.removeAttribute("hidden");

  paypalButton.addEventListener("click", async () => {
    try {
      await paypalPaymentSession.start(
        { presentationMode: "auto" },
        createSetupToken(),
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
 * Creates a PayPal setup token by sending a request to the server.
 * @async
 * @function
 * @returns {Promise<Object>} The created setup token object.
 */
async function createSetupToken() {
  const response = await fetch("/paypal-api/vault/setup-token/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { id } = await response.json();

  return { setupToken: id };
}

/**
 * Creates a PayPal payment token using the provided vault setup token.
 * @async
 * @function
 * @param {string} vaultSetupToken - The vault setup token.
 * @returns {Promise<Object>} The created payment token response data.
 */
async function createPaymentToken(vaultSetupToken) {
  const response = await fetch("/paypal-api/vault/payment-token/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ vaultSetupToken }),
  });
  const data = await response.json();

  return data;
}
