async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "PT", // Portugal for Multibanco testing
      components: ["multibanco-payments"],
    });

    // Check if Multibanco is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "EUR",
    });

    const isMultibancoEligible = paymentMethods.isEligible("multibanco");

    if (isMultibancoEligible) {
      setupMultibancoPayment(sdkInstance);
    } else {
      showMessage({
        text: "Multibanco is not eligible. Please ensure your buyer country is Portugal and currency is EUR.",
        type: "error",
      });
      console.error("Multibanco is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function setupMultibancoPayment(sdkInstance) {
  try {
    // Create Multibanco checkout session
    const multibancoCheckout =
      sdkInstance.createMultibancoOneTimePaymentSession({
        onApprove: handleApprove,
        onCancel: handleCancel,
        onError: handleError,
      });

    // Setup payment fields
    setupPaymentFields(multibancoCheckout);

    // Setup button click handler
    setupButtonHandler(multibancoCheckout);
  } catch (error) {
    console.error("Error setting up Multibanco payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function setupPaymentFields(multibancoCheckout) {
  // Create payment field for full name with optional prefill
  const fullNameField = multibancoCheckout.createPaymentFields({
    type: "name",
    value: "", // Optional prefill value
    style: {
      // Optional styling to match your website
      variables: {
        textColor: "#333333",
        colorTextPlaceholder: "#999999",
        fontFamily: "Verdana, sans-serif",
        fontSizeBase: "14px",
      },
    },
  });

  // Mount the field to the container
  document.querySelector("#multibanco-full-name").appendChild(fullNameField);
}

function setupButtonHandler(multibancoCheckout) {
  const multibancoButton = document.querySelector("#multibanco-button");
  multibancoButton.removeAttribute("hidden");

  multibancoButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate the payment fields
      const isValid = await multibancoCheckout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // Start payment flow with popup mode
        await multibancoCheckout.start(
          { presentationMode: "popup" },
          createOrder(),
        );
      } else {
        console.error("Validation failed");
        showMessage({
          text: "Please fill in all required fields correctly.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      showMessage({
        text:
          error.message ||
          "An error occurred during payment. Please try again.",
        type: "error",
      });
    }
  });
}

// Create PayPal order
async function createOrder() {
  try {
    console.log("Creating PayPal order for Multibanco...");

    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currencyCode: "EUR",
          processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    const { id } = await response.json();
    console.log("Order created with ID:", id);

    return { orderId: id };
  } catch (error) {
    console.error("Error creating order:", error);
    showMessage({
      text: "Failed to create order. Please try again.",
      type: "error",
    });
    throw error;
  }
}

// Get order details after approval
async function getOrder(orderId) {
  try {
    const response = await fetch(`/paypal-api/checkout/orders/${orderId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to get order details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting order:", error);
    throw error;
  }
}

// Handle successful payment approval
async function handleApprove(data) {
  try {
    console.log("Payment approved. Order ID:", data.orderId);

    // Get the order details to show to the user
    const orderDetails = await getOrder(data.orderId);

    showMessage({
      text: `Payment successful! Order ID: ${data.orderId}`,
      type: "success",
    });

    console.log("Order details:", orderDetails);
  } catch (error) {
    console.error("Error in approval handler:", error);
    showMessage({
      text: "Payment completed, but there was an error retrieving order details.",
      type: "error",
    });
  }
}

// Handle payment cancellation
function handleCancel(data) {
  console.log("Payment cancelled by user");
  showMessage({
    text: "Payment was cancelled. No charges were made.",
    type: "error",
  });
}

// Handle payment errors
function handleError(error) {
  console.error("Payment error:", error);
  showMessage({
    text:
      error.message || "An error occurred during payment. Please try again.",
    type: "error",
  });
}

// Helper function to display messages
function showMessage({ text, type }) {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.className = `message ${type} show`;

  setTimeout(() => {
    messageEl.classList.remove("show");
  }, 5000);
}

// Get client ID from server
async function getBrowserSafeClientId() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-id", {
    method: "GET",
  });
  const { clientId } = await response.json();
  return clientId;
}
