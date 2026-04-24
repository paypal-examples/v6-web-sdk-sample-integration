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
      renderAlert({
        type: "warning",
        message:
          "Multibanco is not eligible. Please ensure your buyer country is Portugal.",
      });
      console.error("Multibanco is not eligible");
    }
  } catch (error) {
    renderAlert({
      type: "danger",
      message: "Failed to initialize the PayPal Web SDK",
    });
    console.error("Error initializing PayPal SDK:", error);
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
    renderAlert({
      type: "danger",
      message: "Failed to set up Multibanco Payment Session",
    });
    console.error("Error setting up Multibanco payment:", error);
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

  // Create payment field for email with optional prefill
  const emailField = multibancoCheckout.createPaymentFields({
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
  document.querySelector("#multibanco-full-name").appendChild(fullNameField);
  document.querySelector("#multibanco-email").appendChild(emailField);
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
        renderAlert({
          type: "info",
          message: "Validation successful, starting payment flow...",
        });

        console.log("Validation successful, starting payment flow...");

        // get the promise reference by invoking createOrder()
        // do not await this async function since it can cause transient activation issues
        const createOrderPromise = createOrder();

        // Start payment flow with popup mode
        await multibancoCheckout.start(
          { presentationMode: "popup" },
          createOrderPromise,
        );
      } else {
        renderAlert({
          type: "danger",
          message: "Please fill in all required fields correctly",
        });
        console.error("Validation failed");
      }
    } catch (error) {
      renderAlert({
        type: "danger",
        message: "An error occurred during payment",
      });
      console.error("Payment error:", error);
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
        body: JSON.stringify({ currencyCode: "EUR" }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    const { id } = await response.json();
    renderAlert({ type: "info", message: `Order successfully created: ${id}` });

    console.log("Order created with ID:", id);

    return { orderId: id };
  } catch (error) {
    console.error("Error creating order:", error);
    renderAlert({
      type: "danger",
      message: "Failed to create order. Please try again.",
    });

    throw error;
  }
}

// Capture order after approval
async function captureOrder(orderId) {
  try {
    console.log("Capturing order:", orderId);

    const response = await fetch(
      `/paypal-api/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to capture order");
    }

    const data = await response.json();
    console.log("Order captured successfully:", data);

    return data;
  } catch (error) {
    console.error("Error capturing order:", error);
    throw error;
  }
}

// Handle successful payment approval
async function handleApprove(data) {
  console.log("Payment approved:", data);

  try {
    const result = await captureOrder(data.orderId);
    console.log("Capture successful:", result);
    renderAlert({
      type: "success",
      message: `Payment successful! Order ID: ${data.orderId}. Check console for details.`,
    });
  } catch (error) {
    console.error("Capture failed:", error);
    renderAlert({
      type: "danger",
      message: `Payment approved but capture failed.`,
    });
  }
}

// Handle payment cancellation
function handleCancel(data) {
  console.log("Payment cancelled:", data);
  renderAlert({
    type: "warning",
    message: "Payment was cancelled. You can try again.",
  });
}

// Handle payment errors
function handleError(error) {
  console.error("Payment error:", error);
  renderAlert({
    type: "danger",
    message:
      "An error occurred during payment. Please try again or contact support.",
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

function renderAlert({ type, message }) {
  const alertComponentElement = document.querySelector("alert-component");
  if (!alertComponentElement) {
    return;
  }

  alertComponentElement.setAttribute("type", type);
  alertComponentElement.innerText = message;
}
