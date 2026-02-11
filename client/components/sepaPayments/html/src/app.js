async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "DE", // Germany for SEPA testing
      components: ["sepa-payments"],
    });

    setupSepaPayment(sdkInstance);
  } catch (error) {
    renderAlert({
      type: "danger",
      message: "Failed to initialize the PayPal Web SDK",
    });
    console.error("Error initializing PayPal SDK:", error);
  }
}

function setupSepaPayment(sdkInstance) {
  try {
    async function onApprove(data) {
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
          message: "Payment approved but capture failed.",
        });
      }
    }

    function onCancel(data) {
      console.log("Payment cancelled:", data);
      renderAlert({
        type: "warning",
        message: "Payment was cancelled. You can try again.",
      });
    }

    function onError(error) {
      console.error("Payment error:", error);
      renderAlert({
        type: "danger",
        message:
          "An error occurred during payment. Please try again or contact support.",
      });
    }

    // Create SEPA checkout session
    const sepaCheckout = sdkInstance.createSepaOneTimePaymentSession({
      onApprove,
      onCancel,
      onError,
    });

    // Setup button click handler
    setupButtonHandler(sepaCheckout);

    // Setup button customization
    setupButtonCustomization();
  } catch (error) {
    renderAlert({
      type: "danger",
      message: "Failed to set up SEPA Payment Session",
    });
    console.error("Error setting up SEPA payment:", error);
  }
}

function setupButtonHandler(sepaCheckout) {
  const sepaButton = document.querySelector("#sepa-button");
  sepaButton.removeAttribute("hidden");

  sepaButton.addEventListener("click", async () => {
    try {
      console.log("Validating SEPA payment...");

      // Validate the payment session
      const isValid = await sepaCheckout.validate();

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
        await sepaCheckout.start(
          { presentationMode: "popup" },
          createOrderPromise,
        );
      } else {
        renderAlert({
          type: "danger",
          message: "Validation failed",
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

function setupButtonCustomization() {
  const sepaButton = document.querySelector("#sepa-button");

  // Button color control
  document
    .querySelector("#button-color")
    .addEventListener("change", (event) => {
      const color = event.target.value;
      // Remove all color classes
      sepaButton.classList.remove("sepa-white", "sepa-black");
      // Add the selected color class if not default silver
      if (color !== "silver") {
        sepaButton.classList.add(color);
      }
      // Force the web component to re-render
      sepaButton.requestUpdate();
      renderAlert({
        type: "info",
        message: `Button color updated to ${color}`,
      });
    });

  // Button type control
  document.querySelector("#button-type").addEventListener("change", (event) => {
    const type = event.target.value;
    if (type === "none") {
      sepaButton.removeAttribute("type");
    } else {
      sepaButton.setAttribute("type", type);
    }
    renderAlert({
      type: "info",
      message: `Button type updated to ${type}`,
    });
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
    renderAlert({
      type: "info",
      message: `Order successfully created: ${id}`,
    });

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
