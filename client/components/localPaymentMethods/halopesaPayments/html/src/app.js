async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "TZ", // HaloPesa testing
      components: ["halopesa-payments"],
    });

    // Check if HaloPesa is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "TZS",
    });

    const isHaloPesaEligible = paymentMethods.isEligible("halopesa");

    if (isHaloPesaEligible) {
      configureHaloPesaPayment(sdkInstance);
    } else {
      showMessage({
        text: "HaloPesa is not eligible. Please ensure your buyer country is TZ and currency is TZS.",
        type: "error",
      });
      console.error("HaloPesa is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function configureHaloPesaPayment(sdkInstance) {
  try {
    // Create HaloPesa checkout session
    const halopesaCheckout = sdkInstance.createHalopesaOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });

    // Setup payment fields
    configurePaymentFields(halopesaCheckout);

    // Setup button click handler
    configureButtonHandler(halopesaCheckout);
  } catch (error) {
    console.error("Error setting up HaloPesa payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function configurePaymentFields(checkout) {
  // Create payment field for full name with optional prefill
  const fullNameField = checkout.createPaymentFields({
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
  const emailField = checkout.createPaymentFields({
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
  document.querySelector("#halopesa-full-name").appendChild(fullNameField);
  document.querySelector("#halopesa-email").appendChild(emailField);
}

function configureButtonHandler(checkout) {
  const button = document.querySelector("#halopesa-button");
  button.removeAttribute("hidden");

  button.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate the payment fields
      const isValid = await checkout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // Start payment flow with popup mode
        await checkout.start({ presentationMode: "auto" }, createOrder());
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
    console.log("Creating PayPal order for HaloPesa...");

    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currencyCode: "TZS",
          processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
          // HaloPesa enforces a minimum order amount; the default 2-unit
          // cart total (205.00) falls below it, so bump quantities here.
          cart: [
            { sku: "1blwyeo8", quantity: 10 },
            { sku: "i5b1g92y", quantity: 10 },
          ],
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
