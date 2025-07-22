async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-messages"],
    });
    sdkInstance.createPayPalMessages();
    addAmountEventListener();
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

// basic example product interaction
function addAmountEventListener() {
  const messageElement = document.querySelector("#paypal-message");
  const quantityInput = document.querySelector("#quantity-input");
  const totalAmount = document.querySelector("#total-amount");
  const quantity = document.querySelector("#quantity");

  quantityInput.addEventListener("input", (event) => {
    const quantityValue = event.target.value;
    const calculatedTotalAmount = (50 * quantityValue).toFixed(2).toString();

    quantity.innerHTML = quantityValue;
    totalAmount.innerHTML = calculatedTotalAmount;

    messageElement.amount = calculatedTotalAmount;
  });
}
