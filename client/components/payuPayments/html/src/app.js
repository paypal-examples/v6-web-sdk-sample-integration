
// Utility function to show messages to user
function showMessage({ text, type }) {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.className = `message ${type} show`;
}

// Get client id from server
async function getBrowserSafeClientId() {
  try {
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
  } catch (error) {
    console.error("Error fetching client id:", error);
    throw error;
  }
}

// Get order details after approval
async function getOrder(orderId) {
  try {
    const response = await fetch(
      `/paypal-api/checkout/orders/${orderId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch order details");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
}

// Create PayPal order
async function createOrder() {
  try {
    const orderPayload = {
      intent: "CAPTURE",
      processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
      purchase_units: [
        {
          amount: {
            currency_code: "PLN",
            value: "10.00",
          },
        },
      ],
    };
    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to create order");
    }
    const { id } = await response.json();
    return { orderId: id };
  } catch (error) {
    showMessage({ text: "Failed to create order. Please try again.", type: "error" });
    throw error;
  }
}

// Handle successful payment approval
async function handleApprove(data) {
  try {
    const orderDetails = await getOrder(data.orderId);
    showMessage({
      text: `Payment successful! Order ID: ${data.orderId}. Check console for order details.`,
      type: "success",
    });
    console.log("Order details:", orderDetails);
  } catch (error) {
    showMessage({
      text: "Transaction successful but failed to fetch order details.",
      type: "error",
    });
    console.error("Failed to fetch order details:", error);
  }
}

// Handle payment cancellation
function handleCancel(data) {
  showMessage({
    text: "Payment was cancelled. You can try again.",
    type: "error",
  });
  console.log("Payment cancelled:", data);
}

// Handle payment errors
function handleError(error) {
  showMessage({
    text: "An error occurred during payment. Please try again or contact support.",
    type: "error",
  });
  console.error("Payment error:", error);
}


// Helper to get query param
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Modular payment field setup with prefill
function setupPaymentFields(payuCheckout, prefillValue) {
  const fullNameField = payuCheckout.createPaymentFields({
    type: "name",
    value: prefillValue || "",
    style: {
      variables: {
        textColor: "#333333",
        colorTextPlaceholder: "#999999",
        fontFamily: "Verdana, sans-serif",
        fontSizeBase: "14px",
      },
    },
  });
  document.querySelector("#payu-full-name").appendChild(fullNameField);
}

// Main PayU integration logic
window.onPayPalWebSdkLoaded = async function onPayPalWebSdkLoaded() {
  try {
    // Prefill logic
    const prefillChecked = getQueryParam("prefillName") === "true";
    const prefillValue = prefillChecked ? "John Doe" : "";

    // Set checkbox state and event
    const prefillCheckbox = document.getElementById("prefill-full-name");
    if (prefillCheckbox) {
      prefillCheckbox.checked = prefillChecked;
      prefillCheckbox.addEventListener("change", () => {
        const searchParams = new URLSearchParams(window.location.search);
        if (prefillCheckbox.checked) {
          searchParams.set("prefillName", "true");
        } else {
          searchParams.delete("prefillName");
        }
        window.location.search = searchParams.toString();
      });
    }

    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "PL",
      components: ["payu-payments"],
    });

    // Check if PayU is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "PLN",
    });
    const isPayuEligible = paymentMethods.isEligible("payu");

    if (isPayuEligible) {
      setupPayuPayment(sdkInstance, prefillValue);
    } else {
      showMessage({
        text: "PayU is not eligible. Please ensure your configuration is correct.",
        type: "error",
      });
      console.error("PayU is not eligible");
    }
  } catch (error) {
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
    console.error("Error initializing PayPal SDK:", error);
  }
}

function setupPayuPayment(sdkInstance, prefillValue) {
  try {
    // Create PayU checkout session
    const payuCheckout = sdkInstance.createPayuOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });

    // Modular payment field setup
    setupPaymentFields(payuCheckout, prefillValue);

    // Setup button click handler
    const payuButton = document.querySelector("#payu-button");
    payuButton.removeAttribute("hidden");
    payuButton.addEventListener("click", async () => {
      try {
        // Validate the payment field
        const isValid = await payuCheckout.validate();
        if (isValid) {
          // Start payment flow with popup mode
          await payuCheckout.start(
            { presentationMode: "popup" },
            createOrder()
          );
        } else {
          showMessage({
            text: "Please fill in the required field correctly.",
            type: "error",
          });
        }
      } catch (error) {
        showMessage({
          text: error.message || "An error occurred during payment. Please try again.",
          type: "error",
        });
        console.error("Payment error:", error);
      }
    });
  } catch (error) {
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
    console.error("Error setting up PayU payment:", error);
  }
}
