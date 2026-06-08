async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "MY",
      components: ["fpx-payments"],
    });
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "MYR",
    });
    const isEligible = paymentMethods.isEligible("fpx");
    if (isEligible) {
      setupPayment(sdkInstance);
    } else {
      showMessage({
        text: "FPX is not eligible. Please ensure your buyer country is Malaysia and currency is MYR.",
        type: "error",
      });
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function setupPayment(sdkInstance) {
  try {
    const apmCheckout = sdkInstance.createFpxOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });
    setupPaymentFields(apmCheckout);
    setupButtonHandler(apmCheckout);
  } catch (error) {
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function setupPaymentFields(apmCheckout) {
  const fullNameField = apmCheckout.createPaymentFields({
    type: "name",
    value: "",
    style: {
      variables: {
        textColor: "#333333",
        colorTextPlaceholder: "#999999",
        fontFamily: "Verdana, sans-serif",
        fontSizeBase: "14px",
      },
    },
  });
  document.querySelector("#fpx-full-name").appendChild(fullNameField);
}

function setupButtonHandler(apmCheckout) {
  const apmButton = document.querySelector("#fpx-button");
  apmButton.removeAttribute("hidden");
  apmButton.addEventListener("click", async () => {
    try {
      const isValid = await apmCheckout.validate();
      if (isValid) {
        await apmCheckout.start({ presentationMode: "popup" }, createOrder());
      } else {
        showMessage({
          text: "Please fill in all required fields correctly.",
          type: "error",
        });
      }
    } catch (error) {
      showMessage({
        text:
          error.message ||
          "An error occurred during payment. Please try again.",
        type: "error",
      });
    }
  });
}

async function createOrder() {
  try {
    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currencyCode: "MYR",
          processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
        }),
      },
    );
    if (!response.ok) throw new Error("Failed to create order");
    const { id } = await response.json();
    return { orderId: id };
  } catch (error) {
    showMessage({
      text: "Failed to create order. Please try again.",
      type: "error",
    });
    throw error;
  }
}

async function getOrder(orderId) {
  const response = await fetch(`/paypal-api/checkout/orders/${orderId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch order details");
  return response.json();
}

async function handleApprove(data) {
  try {
    const orderDetails = await getOrder(data.orderId);
    console.log("Order details:", orderDetails);
    showMessage({
      text: `Payment successful! Order ID: ${data.orderId}. Check console for order details.`,
      type: "success",
    });
  } catch (error) {
    showMessage({
      text: "Transaction successful but failed to fetch order details.",
      type: "error",
    });
  }
}

function handleCancel(data) {
  console.log("Payment cancelled:", data);
  showMessage({
    text: "Payment was cancelled. You can try again.",
    type: "error",
  });
}
function handleError(error) {
  console.error("Payment error:", error);
  showMessage({
    text: "An error occurred during payment. Please try again or contact support.",
    type: "error",
  });
}

async function getBrowserSafeClientId() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-id", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch client id");
  const { clientId } = await response.json();
  return clientId;
}

function showMessage({ text, type }) {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.className = `message ${type} show`;
}
