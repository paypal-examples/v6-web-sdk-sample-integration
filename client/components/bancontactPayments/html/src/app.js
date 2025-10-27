async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      testBuyerCountry: "BE", // Belgium for Bancontact testing
      components: ["bancontact-payments"],
    });

    // Check if Bancontact is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "EUR",
    });

    const isBancontactEligible = paymentMethods.isEligible("bancontact");

    if (isBancontactEligible) {
      setupBancontactPayment(sdkInstance);
    } else {
      showMessage({
        text: "Bancontact is not eligible. Please ensure your buyer country is Belgium.",
        type: "error",
      });
      console.error("Bancontact is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function setupBancontactPayment(sdkInstance) {
  try {
    // Create Bancontact checkout session
    const bancontactCheckout =
      sdkInstance.createBancontactOneTimePaymentSession({
        onApprove: handleApprove,
        onCancel: handleCancel,
        onError: handleError,
      });

    // Setup payment fields
    setupPaymentFields(bancontactCheckout);

    // Setup button click handler
    setupButtonHandler(bancontactCheckout);
  } catch (error) {
    console.error("Error setting up Bancontact payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function setupPaymentFields(bancontactCheckout) {
  // Create payment field for full name with optional prefill
  const fullNameField = bancontactCheckout.createPaymentFields({
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
  document.querySelector("#bancontact-full-name").appendChild(fullNameField);
}

function setupButtonHandler(bancontactCheckout) {
  const bancontactButton = document.querySelector("#bancontact-button");
  bancontactButton.removeAttribute("hidden");

  bancontactButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate the payment fields
      const isValid = await bancontactCheckout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // Start payment flow with popup mode
        await bancontactCheckout.start(
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

    const orderPayload = {
      intent: "CAPTURE",
      purchaseUnits: [
        {
          amount: {
            currencyCode: "EUR",
            value: "10.00",
          },
        },
      ],
    };

    const response = await fetch("/paypal-api/checkout/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

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

    showMessage({
      text: `Payment successful! Order ID: ${data.orderId}. Check console for details.`,
      type: "success",
    });
  } catch (error) {
    console.error("Capture failed:", error);
    showMessage({
      text: "Payment approved but capture failed.",
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

// Get client token from server
async function getBrowserSafeClientToken() {
  try {
    const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch client token");
    }

    const { accessToken } = await response.json();
    return accessToken;
  } catch (error) {
    console.error("Error fetching client token:", error);
    throw error;
  }
}

// Utility function to show messages to user
function showMessage({ text, type }) {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.className = `message ${type} show`;
}
