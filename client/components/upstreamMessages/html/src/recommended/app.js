async function onPayPalLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-messages"],
    });
    const content = await createMessage(sdkInstance);
    addAmountEventListener(content);
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

  const content = await messagesInstance.fetchContent({
    onReady: (content) => {
      messageElement.setContent(content);
    },
  });

  return content;
}

// basic example product interaction
function addAmountEventListener(content) {
  const quantityInput = document.querySelector("#quantity-input");
  const totalAmount = document.querySelector("#total-amount");
  const quantity = document.querySelector("#quantity");

  quantityInput.addEventListener("input", (event) => {
    const quantityValue = event.target.value;
    const calculatedTotalAmount = (50 * quantityValue).toString();

    quantity.innerHTML = quantityValue;
    totalAmount.innerHTML = calculatedTotalAmount;

    content.update({ amount: calculatedTotalAmount });
  });
}
