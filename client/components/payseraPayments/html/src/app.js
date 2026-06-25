/**
 * Paysera One-Time Payment Integration
 *
 * This module handles Paysera payment processing using PayPal's v6 Web SDK.
 * Paysera requires full name and email fields and uses popup-based payment confirmation.
 */

/**
 * Main setup function called when PayPal SDK is loaded
 */
async function onPayPalWebSdkLoaded() {
  try {
    // Fetch browser-safe client ID from server
    const authResponse = await fetch("/paypal-api/auth/browser-safe-client-id");
    const auth = await authResponse.json();

    const testBuyerCountry = "LT"; // Lithuania (Paysera is popular in Baltic region)
    const currencyCode = "EUR"; // Paysera uses EUR

    // Initialize PayPal SDK instance with Paysera components
    const sdkInstance = await window.paypal.createInstance({
      clientId: auth.clientId,
      components: ["paysera-payments"],
      testBuyerCountry: testBuyerCountry,
    });

    console.log("PayPal SDK initialized successfully");

    // Check if Paysera is eligible for the currency
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: currencyCode,
    });

    const isPayseraEligible = paymentMethods.isEligible("paysera");

    if (!isPayseraEligible) {
      showMessage({
        text: "Paysera is not eligible for the selected currency (EUR)",
        type: "error",
      });
      return;
    }

    // Setup Paysera payment flow
    await setupPayseraPayment(sdkInstance, currencyCode);
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

/**
 * Creates an order for Paysera payment
 * @param {string} currencyCode - Currency code (EUR)
 * @returns {Promise<{id: string}>} Order object with ID
 */
async function createOrder(currencyCode) {
  try {
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { id } = await response.json();
    console.log("Order created:", id);
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

/**
 * Fetches order details from server
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
async function getOrder(orderId) {
  try {
    const response = await fetch(`/paypal-api/checkout/orders/${orderId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

/**
 * Sets up Paysera payment fields and handlers
 * @param {Object} sdkInstance - PayPal SDK instance
 * @param {string} currencyCode - Currency code
 */
async function setupPayseraPayment(sdkInstance, currencyCode) {
  // Create Paysera payment session
  const payseraCheckout = sdkInstance.createPayseraOneTimePaymentSession({
    onApprove: async (data) => {
      console.log("Payment approved:", data);

      try {
        const orderDetails = await getOrder(data.orderId);
        console.log("Order details:", orderDetails);

        showMessage({
          text: `Payment successful! Order ID: ${data.orderId}. Check console for order details.`,
          type: "success",
        });
      } catch (error) {
        console.error("Error fetching order details:", error);
        showMessage({
          text: "Transaction successful but failed to fetch order details.",
          type: "error",
        });
      }
    },
    onCancel: (data) => {
      console.log("Payment cancelled:", data);
      showMessage({
        text: "Payment was cancelled. You can try again.",
        type: "error",
      });
    },
    onError: (error) => {
      console.error("Payment error:", error);
      showMessage({
        text: "An error occurred during payment. Please try again or contact support.",
        type: "error",
      });
    },
  });

  // Create and render full name field
  const fullnameField = payseraCheckout.createPaymentFields({
    type: "name",
  });

  const fullnameContainer = document.querySelector("#paysera-full-name");
  fullnameContainer.appendChild(fullnameField);

  // Create and render email field
  const emailField = payseraCheckout.createPaymentFields({
    type: "email",
  });

  const emailContainer = document.querySelector("#paysera-email");
  emailContainer.appendChild(emailField);

  // Setup button click handler
  const payseraButton = document.querySelector("#paysera-button");
  payseraButton.removeAttribute("hidden");

  payseraButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate the payment fields
      const valid = await payseraCheckout.validate();

      if (valid) {
        console.log("Validation successful, starting payment flow...");
        // Start payment with popup presentation
        await payseraCheckout.start(
          { presentationMode: "popup" },
          createOrder(currencyCode),
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
