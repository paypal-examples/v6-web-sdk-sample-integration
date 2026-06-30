async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "GB", // United Kingdom for Klarna testing
      components: ["klarna-payments"],
    });

    // Check if Klarna is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "GBP",
    });

    const isKlarnaEligible = paymentMethods.isEligible("klarna");

    if (isKlarnaEligible) {
      configureKlarnaPayment(sdkInstance);
    } else {
      showMessage({
        text: "Klarna is not eligible. Please ensure your buyer country and currency are supported.",
        type: "error",
      });
      console.error("Klarna is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function configureKlarnaPayment(sdkInstance) {
  try {
    // Create Klarna checkout session
    const klarnaCheckout = sdkInstance.createKlarnaOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });

    // Setup payment fields
    configurePaymentFields(klarnaCheckout);

    // Setup button click handler
    configureButtonHandler(klarnaCheckout);
  } catch (error) {
    console.error("Error setting up Klarna payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function configurePaymentFields(klarnaCheckout) {
  // Create payment field for full name with optional prefill
  const fullNameField = klarnaCheckout.createPaymentFields({
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

  // Create payment field for email with optional prefill
  const emailField = klarnaCheckout.createPaymentFields({
    type: "email",
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

  // Mount the fields to the containers
  document.querySelector("#klarna-full-name").appendChild(fullNameField);
  document.querySelector("#klarna-email").appendChild(emailField);
}

function configureButtonHandler(klarnaCheckout) {
  const klarnaButton = document.querySelector("#klarna-button");
  klarnaButton.removeAttribute("hidden");

  klarnaButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate the payment fields (name and email)
      const isValid = await klarnaCheckout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // Start payment flow with popup mode
        await klarnaCheckout.start(
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
    console.log("Creating PayPal order for Klarna...");

    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currencyCode: "GBP",
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
    console.log("Fetching order details:", orderId);

    const response = await fetch(`/paypal-api/checkout/orders/${orderId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

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

// Handle payment error
function handleError(error) {
  console.error("Payment error:", error);
  showMessage({
    text:
      error.message || "An error occurred during payment. Please try again.",
    type: "error",
  });
}

// Utility function to display messages
function showMessage({ text, type }) {
  const messageEl = document.querySelector("#message");
  messageEl.textContent = text;
  messageEl.className = `message ${type} show`;

  setTimeout(() => {
    messageEl.classList.remove("show");
  }, 5000);
}

// Fetch browser-safe client ID from server
async function getBrowserSafeClientId() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-id");
  const data = await response.json();
  return data.clientId;
}
