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
