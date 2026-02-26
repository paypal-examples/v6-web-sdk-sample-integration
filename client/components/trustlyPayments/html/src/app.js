async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "SE", // Sweden for Trustly testing
      components: ["trustly-payments"],
    });

    // Check if Trustly is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "SEK",
    });

    const isTrustlyEligible = paymentMethods.isEligible("trustly");

    if (isTrustlyEligible) {
      setupTrustlyPayment(sdkInstance);
    } else {
      showMessage({
        text: "Trustly is not eligible. Please ensure your buyer country is Sweden and currency is SEK.",
        type: "error",
      });
      console.error("Trustly is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function setupTrustlyPayment(sdkInstance) {
  try {
    // Create Trustly checkout session
    const trustlyCheckout = sdkInstance.createTrustlyOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });

    // Setup payment fields
    setupPaymentFields(trustlyCheckout);

    // Setup button click handler
    setupButtonHandler(trustlyCheckout);
  } catch (error) {
    console.error("Error setting up Trustly payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function setupPaymentFields(trustlyCheckout) {
  // Create payment field for full name with optional prefill
  const fullNameField = trustlyCheckout.createPaymentFields({
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

  // Create email field
  const emailField = trustlyCheckout.createPaymentFields({
    type: "email",
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

  // Mount the fields to the containers
  document.querySelector("#trustly-full-name").appendChild(fullNameField);
  document.querySelector("#trustly-email").appendChild(emailField);
}

function setupButtonHandler(trustlyCheckout) {
  const trustlyButton = document.querySelector("#trustly-button");
  trustlyButton.removeAttribute("hidden");

  trustlyButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate the payment fields
      const isValid = await trustlyCheckout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // Start payment flow with popup mode
        await trustlyCheckout.start({ presentationMode: "popup" }, createOrder());
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
        text: "An error occurred during payment. Please try again.",
        type: "error",
      });
    }
  });
}

// Create PayPal order
async function createOrder() {
  try {
    console.log("Creating PayPal order...");

    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currencyCode: "SEK" }),
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
    console.log("Fetching order details:", orderId);

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
    console.log("Order details fetched successfully:", data);

    return data;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
}

// Handle successful payment approval
async function handleApprove(data) {
  console.log("Payment approved:", data);

  try {
    const orderDetails = await getOrder(data.orderId);
    console.log("Order details:", orderDetails);

    showMessage({
      text: `Payment successful! Order ID: ${data.orderId}. Check console for order details.`,
      type: "success",
    });
  } catch (error) {
    console.error("Failed to fetch order details:", error);
    showMessage({
      text: "Transaction successful but failed to fetch order details.",
      type: "error",
    });
  }
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
