async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "EE", // Estonia for Estonia Banks testing
      components: ["estoniabank-payments"],
    });

    // Check if Estonia Banks is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "EUR",
    });

    const isEstoniaBanksEligible = paymentMethods.isEligible("estonia_banks");

    if (isEstoniaBanksEligible) {
      configureEstoniaBanksPayment(sdkInstance);
    } else {
      showMessage({
        text: "Estonia Banks is not eligible. Please ensure your buyer country is Estonia and currency is EUR.",
        type: "error",
      });
      console.error("Estonia Banks is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function configureEstoniaBanksPayment(sdkInstance) {
  try {
    // Create Estonia Banks checkout session
    const estoniaBanksCheckout = sdkInstance.createEstoniaOneTimePaymentSession(
      {
        onApprove: handleApprove,
        onCancel: handleCancel,
        onError: handleError,
      },
    );

    // Setup payment fields
    configurePaymentFields(estoniaBanksCheckout);

    // Setup button click handler
    configureButtonHandler(estoniaBanksCheckout);
  } catch (error) {
    console.error("Error setting up Estonia Banks payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function configurePaymentFields(estoniaBanksCheckout) {
  // Create payment field for full name with optional prefill
  const fullNameField = estoniaBanksCheckout.createPaymentFields({
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
  document.querySelector("#estonia-banks-full-name").appendChild(fullNameField);
}

function configureButtonHandler(estoniaBanksCheckout) {
  const estoniaBanksButton = document.querySelector("#estonia-banks-button");
  estoniaBanksButton.removeAttribute("hidden");

  estoniaBanksButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate the payment fields
      const isValid = await estoniaBanksCheckout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // Start payment flow with popup mode
        await estoniaBanksCheckout.start(
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
    console.log("Creating PayPal order for Estonia Banks...");

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
