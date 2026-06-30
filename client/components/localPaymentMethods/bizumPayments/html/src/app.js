async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "ES", // Spain for Bizum testing
      components: ["bizum-payments"],
    });

    // Check if Bizum is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "EUR",
    });

    const isBizumEligible = paymentMethods.isEligible("bizum");

    if (isBizumEligible) {
      configureBizumPayment(sdkInstance);
    } else {
      showMessage({
        text: "Bizum is not eligible. Please ensure your buyer country is Spain and currency is EUR.",
        type: "error",
      });
      console.error("Bizum is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function configureBizumPayment(sdkInstance) {
  try {
    // Create Bizum checkout session
    const bizumCheckout = sdkInstance.createBizumOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });

    // Setup payment fields
    configurePaymentFields(bizumCheckout);

    // Setup button click handler
    configureButtonHandler(bizumCheckout);
  } catch (error) {
    console.error("Error setting up Bizum payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function configurePaymentFields(bizumCheckout) {
  // Create payment field for full name with optional prefill
  const fullNameField = bizumCheckout.createPaymentFields({
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
  document.querySelector("#bizum-full-name").appendChild(fullNameField);
}

function configureButtonHandler(bizumCheckout) {
  const bizumButton = document.querySelector("#bizum-button");
  bizumButton.removeAttribute("hidden");

  bizumButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate the payment fields (name)
      const isValid = await bizumCheckout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // Start payment flow with popup mode
        await bizumCheckout.start({ presentationMode: "popup" }, createOrder());
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
  const response = await fetch(`/paypal-api/checkout/orders/${orderId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch order details");
  }
  return response.json();
}

// Get browser-safe client ID
async function getBrowserSafeClientId() {
  try {
    const response = await fetch("/paypal-api/auth/browser-safe-client-id");
    if (!response.ok) {
      throw new Error("Failed to fetch client ID");
    }
    const data = await response.json();
    return data.clientId;
  } catch (error) {
    console.error("Error fetching client ID:", error);
    throw error;
  }
}

// Handle payment approval
async function handleApprove(data) {
  try {
    console.log("Payment approved:", data);

    const order = await getOrder(data.orderId);

    // Show success message with order details
    showMessage({
      text: `Payment successful! Order ID: ${order.id}`,
      type: "success",
    });
  } catch (error) {
    console.error("Error handling approval:", error);
    showMessage({
      text: "Payment approved but order details could not be retrieved.",
      type: "error",
    });
  }
}

// Handle payment cancellation
function handleCancel(data) {
  console.log("Payment cancelled:", data);
  showMessage({
    text: "Payment was cancelled. Please try again if needed.",
    type: "error",
  });
}

// Handle payment error
function handleError(error) {
  console.error("Payment error:", error);
  showMessage({
    text: "An error occurred during payment. Please try again.",
    type: "error",
  });
}

// Display message to user
function showMessage({ text, type }) {
  const messageDiv = document.querySelector("#message");
  messageDiv.textContent = text;
  messageDiv.className = `message ${type} show`;

  // Auto-hide message after 5 seconds
  setTimeout(() => {
    messageDiv.classList.remove("show");
  }, 5000);
}
