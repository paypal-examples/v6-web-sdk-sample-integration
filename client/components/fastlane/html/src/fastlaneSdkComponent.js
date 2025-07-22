let fastlane;
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
