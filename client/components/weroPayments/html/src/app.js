async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "DE", // Germany for Wero testing
      components: ["wero-payments"],
    });

    // Check if Wero is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "EUR",
    });

    const isWeroEligible = paymentMethods.isEligible("wero");

    if (isWeroEligible) {
      setupWeroPayment(sdkInstance);
    } else {
      showMessage({
        text: "Wero is not eligible. Please ensure your buyer country is Germany and currency is EUR.",
        type: "error",
      });
      console.error("Wero is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function setupWeroPayment(sdkInstance) {
  try {
    // Create Wero checkout session
    const weroCheckout = sdkInstance.createWeroOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });

    // Setup payment fields
    setupPaymentFields(weroCheckout);

    // Setup button click handler
    setupButtonHandler(weroCheckout);
  } catch (error) {
    console.error("Error setting up Wero payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function setupPaymentFields(weroCheckout) {
  // Create payment field for full name with optional prefill
  const fullNameField = weroCheckout.createPaymentFields({
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
  document.querySelector("#wero-full-name").appendChild(fullNameField);
}

function setupButtonHandler(weroCheckout) {
  const weroButton = document.querySelector("#wero-button");
  weroButton.removeAttribute("hidden");

  weroButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate the payment fields
      const isValid = await weroCheckout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // Start payment flow with popup mode
        await weroCheckout.start({ presentationMode: "popup" }, createOrder());
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
    console.log("Creating PayPal order for Wero...");

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


// Handle successful payment approval
function handleApprove(data) {
  console.log("Payment approved:", data);
  showMessage({
    text: `Payment successful! Order ID: ${data.orderId}.`,
    type: "success",
  });
}

// Handle payment cancellation
function handleCancel(data) {
  console.log("Payment cancelled:", data);
  showMessage({
    text: "Payment was cancelled. You can try again.",
    type: "error",
  });
}

// Handle payment errors
function handleError(error) {
  console.error("Payment error:", error);
  showMessage({
    text: "An error occurred during payment. Please try again or contact support.",
    type: "error",
  });
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

// Utility function to show messages to user
function showMessage({ text, type }) {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.className = `message ${type} show`;
}
