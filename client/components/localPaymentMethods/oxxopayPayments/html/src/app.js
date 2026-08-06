/**
 * OxxoPay One-Time Payment Integration
 *
 * This module handles OxxoPay payment processing using PayPal's v6 Web SDK.
 * OxxoPay requires full name and email fields plus an expiry date, and uses
 * popup-based payment confirmation.
 */

/**
 * Main setup function called when PayPal SDK is loaded
 */
async function onPayPalWebSdkLoaded() {
  try {
    // Fetch browser-safe client ID from server
    const clientId = await getBrowserSafeClientId();

    const testBuyerCountry = "MX"; // Mexico
    const currencyCode = "MXN"; // OxxoPay uses MXN

    // Initialize PayPal SDK instance with OxxoPay components
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      components: ["oxxopay-payments"],
      testBuyerCountry: testBuyerCountry,
    });

    console.log("PayPal SDK initialized successfully");

    // Check if OxxoPay is eligible for the currency
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: currencyCode,
    });

    const isOxxoEligible = paymentMethods.isEligible("oxxo_pay");

    if (!isOxxoEligible) {
      showMessage({
        text: "OxxoPay is not eligible. Please ensure your buyer country is Mexico and currency is MXN.",
        type: "error",
      });
      console.error("OxxoPay is not eligible");
      return;
    }

    // Setup OxxoPay payment flow
    await configureOxxopayPayment(sdkInstance, currencyCode);
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

/**
 * Sets up OxxoPay payment fields and handlers
 * @param {Object} sdkInstance - PayPal SDK instance
 * @param {string} currencyCode - Currency code (MXN)
 */
async function configureOxxopayPayment(sdkInstance, currencyCode) {
  // Create OxxoPay payment session
  const oxxoCheckout = sdkInstance.createOxxopayOneTimePaymentSession({
    onApprove: handleApprove,
    onCancel: handleCancel,
    onError: handleError,
  });

  // Create and render full name field
  const fullnameField = oxxoCheckout.createPaymentFields({
    type: "name",
  });
  document.querySelector("#oxxopay-full-name").appendChild(fullnameField);

  // Create and render email field
  const emailField = oxxoCheckout.createPaymentFields({
    type: "email",
  });
  document.querySelector("#oxxopay-email").appendChild(emailField);

  // Show the additional information fields
  document.querySelector("#custom-fields").removeAttribute("hidden");

  // Setup button click handler
  const oxxoButton = document.querySelector("#oxxopay-button");
  oxxoButton.removeAttribute("hidden");

  oxxoButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate the additional expiry date field
      const expiryData = validateExpiryDate();

      // Validate the SDK payment fields
      const valid = await oxxoCheckout.validate();

      if (valid) {
        console.log("Validation successful, starting payment flow...");

        // Start payment with popup presentation. The session options are
        // resolved once the order is created, supplying the expiry date.
        await oxxoCheckout.start(
          { presentationMode: "popup" },
          createOxxopayOrder(currencyCode, expiryData),
        );
      } else {
        console.error("Validation failed");
        showMessage({
          text: "Please fill in all required fields correctly.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      showMessage({
        text:
          error.message ||
          "An error occurred during payment. Please try again.",
        type: "error",
      });
    }
  });
}

/**
 * Validates the additional expiry date field
 * @returns {Object} Expiry data
 * @throws {Error} If validation fails
 */
function validateExpiryDate() {
  const expiryDate = document.querySelector("#expiry-date").value.trim();
  if (!expiryDate) {
    const errorMessage = "Expiry date is required";
    showMessage({ text: errorMessage, type: "error" });
    throw new Error(errorMessage);
  }
  return { expiryDate };
}

/**
 * Creates an order for OxxoPay payment with the expiry date
 * @param {string} currencyCode - Currency code (MXN)
 * @param {Object} expiryData - Expiry date information
 * @returns {Promise<Object>} Order session options
 */
async function createOxxopayOrder(currencyCode, expiryData) {
  try {
    console.log("Creating PayPal order for OxxoPay...");

    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currencyCode: currencyCode,
          processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    const { id: orderId } = await response.json();
    console.log("Order created with ID:", orderId);

    // Return order session options with the expiry date
    return {
      orderId,
      expiryDate: expiryData.expiryDate,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    showMessage({
      text: "Failed to create order. Please try again.",
      type: "error",
    });
    throw error;
  }
}

/**
 * Fetches order details from server
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
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

/**
 * Handle successful payment approval
 * @param {Object} data - Approval data containing the orderId
 */
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

/**
 * Handle payment cancellation
 * @param {Object} data - Cancellation data
 */
function handleCancel(data) {
  console.log("Payment cancelled:", data);
  showMessage({
    text: "Payment was cancelled. You can try again.",
    type: "error",
  });
}

/**
 * Handle payment errors
 * @param {Object} error - Error data
 */
function handleError(error) {
  console.error("Payment error:", error);
  showMessage({
    text: "An error occurred during payment. Please try again or contact support.",
    type: "error",
  });
}

/**
 * Get client id from server
 */
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

/**
 * Display message to user
 * @param {Object} params - Message parameters
 * @param {string} params.text - Message text
 * @param {string} params.type - Message type (success/error)
 */
function showMessage({ text, type }) {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.className = `message ${type} show`;
}
