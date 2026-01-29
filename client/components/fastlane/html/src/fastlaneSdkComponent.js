let fastlane;
async function onPayPalWebSdkLoaded() {
  const clientId = await getBrowserSafeClientId();

  const sdkInstance = await window.paypal.createInstance({
    clientId,
    pageType: "product-details",
    clientMetadataId: crypto.randomUUID(),
    components: ["fastlane"],
  });

  fastlane = await sdkInstance.createFastlane();
  setupFastlaneSdk();
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
