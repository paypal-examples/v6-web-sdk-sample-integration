let sdkInstance;
let fastlane;
async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();

    sdkInstance = await window.paypal.createInstance({
      clientToken,
      pageType: "product-details",
      clientMetadataId: crypto.randomUUID(),
      components: ["fastlane"],
    });

    fastlane = await sdkInstance.createFastlane();
    setupFastlaneSdk();
  } catch (error) {
    renderAlert({
      type: "danger",
      message: "Failed to initialize the PayPal Web SDK",
    });
    console.error(error);
  }
}

async function getBrowserSafeClientToken() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch client token");
  }
  const { accessToken } = await response.json();

  return accessToken;
}

function renderAlert({ type, message }) {
  const alertComponentElement = document.querySelector("alert-component");
  if (!alertComponentElement) {
    return;
  }

  alertComponentElement.setAttribute("type", type);
  alertComponentElement.innerText = message;
}
