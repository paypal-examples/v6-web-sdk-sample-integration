async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      components: ["paypal-messages"],
    });
    sdkInstance.createPayPalMessages();
    addAmountEventListener();
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
