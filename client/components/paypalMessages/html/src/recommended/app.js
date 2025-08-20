/**
 * Initializes the PayPal Web SDK, creates a PayPal Messages instance,
 * and sets up the product interaction event listener.
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
    sdkInstance.createPayPalMessages();
    addAmountEventListener();
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
 * Adds an event listener to update the displayed quantity, total amount,
 * and PayPal message amount when the product quantity input changes.
 * @function
 * @returns {void}
 */
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
