/**
 * Initializes the PayPal Web SDK, creates a PayPal Messages instance,
 * and renders the PayPal message on the page.
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-messages"],
    });
    createMessage(sdkInstance);
  } catch (error) {
    console.error(error);
  }
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
 * Creates and renders a PayPal message using the SDK instance.
 * @async
 * @function
 * @param {Object} sdkInstance - The PayPal SDK instance.
 * @returns {Promise<Object>} The fetched message content.
 */
async function createMessage(sdkInstance) {
  const messagesInstance = sdkInstance.createPayPalMessages();
  const messageElement = document.querySelector("#paypal-message");

  sdkInstance.createPayPalMessages({
    buyerCountry: "US",
    currencyCode: "USD",
  });

  const content = await messagesInstance.fetchContent({
    textColor: "MONOCHROME",
    onReady: (content) => {
      messageElement.setContent(content);
    },
  });

  return content;
}
