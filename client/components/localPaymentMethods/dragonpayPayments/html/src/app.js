/**
 * Dragonpay One-Time Payment Integration
 *
 * This module handles Dragonpay payment processing using PayPal's v6 Web SDK.
 * Dragonpay requires full name, email, and phone number fields with popup-based payment confirmation.
 */

/**
 * Main setup function called when PayPal SDK is loaded
 */
async function onPayPalWebSdkLoaded() {
  try {
    // Fetch browser-safe client ID from server
    const clientId = await getBrowserSafeClientId();

    const testBuyerCountry = "PH"; // Philippines
    const currencyCode = "PHP"; // Dragonpay uses PHP

    // Initialize PayPal SDK instance with Dragonpay components
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      components: ["dragonpay-payments"],
      testBuyerCountry: testBuyerCountry,
    });

    console.log("PayPal SDK initialized successfully");

    // Check if Dragonpay is eligible for the currency
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: currencyCode,
    });

    const isDragonpayEligible = paymentMethods.isEligible("dragonpay");

    if (!isDragonpayEligible) {
      showMessage({
        text: "Dragonpay is not eligible for the selected currency (PHP)",
        type: "error",
      });
      return;
    }

    // Setup Dragonpay payment flow
    await configureDragonpayPayment(sdkInstance, currencyCode);
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

/**
 * Creates an order for Dragonpay payment with phone data
 * @param {string} currencyCode - Currency code (PHP)
 * @param {Object} phoneData - Phone number information
 * @returns {Promise<Object>} Order session options
 */
async function createDragonpayOrder(currencyCode, phoneData) {
  try {
    console.log("Creating PayPal order for Dragonpay...");

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

    // Return order session options with phone data
    return {
      orderId,
      phone: {
        nationalNumber: phoneData.phoneNationalNumber,
        countryCode: phoneData.phoneCountryCode,
      },
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
 * Sets up Dragonpay payment fields and handlers
 * @param {Object} sdkInstance - PayPal SDK instance
 * @param {string} currencyCode - Currency code
 */
async function configureDragonpayPayment(sdkInstance, currencyCode) {
  // Create Dragonpay payment session
  const dragonpayCheckout = sdkInstance.createDragonpayOneTimePaymentSession({
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
  const fullnameField = dragonpayCheckout.createPaymentFields({
    type: "name",
  });

  const fullnameContainer = document.querySelector("#dragonpay-full-name");
  fullnameContainer.appendChild(fullnameField);

  // Create and render email field
  const emailField = dragonpayCheckout.createPaymentFields({
    type: "email",
  });

  const emailContainer = document.querySelector("#dragonpay-email");
  emailContainer.appendChild(emailField);

  // Show the phone number fields
  document.querySelector("#phone-fields").removeAttribute("hidden");

  // Setup button click handler
  const dragonpayButton = document.querySelector("#dragonpay-button");
  dragonpayButton.removeAttribute("hidden");

  dragonpayButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate phone number fields
      const phoneData = validatePhoneNumber();

      // Validate the payment fields
      const valid = await dragonpayCheckout.validate();

      if (valid) {
        console.log("Validation successful, starting payment flow...");
        // Start payment with popup presentation and phone data
        await dragonpayCheckout.start(
          { presentationMode: "popup" },
          createDragonpayOrder(currencyCode, phoneData),
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
 * Validates phone number fields
 * @returns {Object} Phone data
 * @throws {Error} If validation fails
 */
function validatePhoneNumber() {
  const phoneCountryCode = document
    .querySelector("#phone-country-code")
    .value.trim();
  const phoneNationalNumber = document
    .querySelector("#phone-national-number")
    .value.trim();

  const errors = [];

  if (!phoneCountryCode) errors.push("Phone Country Code");
  if (!phoneNationalNumber) errors.push("Phone National Number");

  if (errors.length > 0) {
    const errorMessage = `The following fields are required: ${errors.join(", ")}`;
    throw new Error(errorMessage);
  }

  return {
    phoneCountryCode,
    phoneNationalNumber,
  };
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
