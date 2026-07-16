/**
 * Lithuania Banks One-Time Payment Integration
 *
 * This module handles Lithuania Banks payment processing using PayPal's v6 Web SDK.
 * Lithuania Banks requires a full name field and uses popup-based payment confirmation.
 */

/**
 * Main setup function called when PayPal SDK is loaded
 */
async function onPayPalWebSdkLoaded() {
  try {
    // Fetch browser-safe client ID from server
    const authResponse = await fetch("/paypal-api/auth/browser-safe-client-id");
    const auth = await authResponse.json();

    const testBuyerCountry = "LT"; // Lithuania
    const currencyCode = "EUR"; // Lithuania Banks uses EUR

    // Initialize PayPal SDK instance with Lithuania Banks components
    const sdkInstance = await window.paypal.createInstance({
      clientId: auth.clientId,
      components: ["lithuaniabanks-payments"],
      testBuyerCountry: testBuyerCountry,
    });

    console.log("PayPal SDK initialized successfully");

    // Check if Lithuania Banks is eligible for the currency
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: currencyCode,
    });

    const isLithuaniaBanksEligible =
      paymentMethods.isEligible("lithuania_banks");

    if (!isLithuaniaBanksEligible) {
      showMessage({
        text: "Lithuania Banks is not eligible for the selected currency (EUR)",
        type: "error",
      });
      return;
    }

    // Setup Lithuania Banks payment flow
    await configureLithuaniaBanksPayment(sdkInstance, currencyCode);
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

/**
 * Creates an order for Lithuania Banks payment
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
 * Sets up Lithuania Banks payment fields and handlers
 * @param {Object} sdkInstance - PayPal SDK instance
 * @param {string} currencyCode - Currency code
 */
async function configureLithuaniaBanksPayment(sdkInstance, currencyCode) {
  // Create Lithuania Banks payment session
  const lithuaniabanksCheckout =
    sdkInstance.createLithuaniaBanksOneTimePaymentSession({
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
  const fullnameField = lithuaniabanksCheckout.createPaymentFields({
    type: "name",
  });

  const fullnameContainer = document.querySelector("#lithuaniabanks-full-name");
  fullnameContainer.appendChild(fullnameField);

  // Setup button click handler
  const lithuaniabanksButton = document.querySelector("#lithuaniabanks-button");
  lithuaniabanksButton.removeAttribute("hidden");

  lithuaniabanksButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate the payment fields
      const valid = await lithuaniabanksCheckout.validate();

      if (valid) {
        console.log("Validation successful, starting payment flow...");
        // Start payment with popup presentation
        await lithuaniabanksCheckout.start(
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
