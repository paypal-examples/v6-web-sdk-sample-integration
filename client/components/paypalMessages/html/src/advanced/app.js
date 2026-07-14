async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      components: ["paypal-messages"],
    });
    createMessage(sdkInstance);
  } catch (error) {
    console.error(error);
  }
}

async function getBrowserSafeClientId() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-id", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch client id");
  }
  const { clientId } = await response.json();

  return clientId;
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
