/**
 * Global variable to hold the Fastlane SDK instance.
 * @type {Object}
 */
let fastlane;

/**
 * Initializes the PayPal Web SDK, creates a Fastlane instance,
 * and sets up the Fastlane SDK experience.
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function onPayPalWebSdkLoaded() {
  const clientToken = await getBrowserSafeClientToken();

  const sdkInstance = await window.paypal.createInstance({
    clientToken,
    pageType: "product-details",
    clientMetadataId: crypto.randomUUID(),
    components: ["fastlane"],
  });

  fastlane = await sdkInstance.createFastlane();
  setupFastlaneSdk();
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
