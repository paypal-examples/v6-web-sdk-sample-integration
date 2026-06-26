/**
 * Boleto Bancario One-Time Payment Integration
 *
 * This module handles Boleto Bancario payment processing using PayPal's v6 Web SDK.
 * Boleto Bancario requires full name and email fields and uses popup-based payment confirmation.
 */

/**
 * Main setup function called when PayPal SDK is loaded
 */
async function onPayPalWebSdkLoaded() {
  try {
    // Fetch browser-safe client ID from server
    const clientId = await getBrowserSafeClientId();

    const testBuyerCountry = "BR"; // Brazil
    const currencyCode = "BRL"; // Boleto Bancario uses BRL

    // Initialize PayPal SDK instance with Boleto Bancario components
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      components: ["boletobancario-payments"],
      testBuyerCountry: testBuyerCountry,
    });

    console.log("PayPal SDK initialized successfully");

    // Check if Boleto Bancario is eligible for the currency
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: currencyCode,
    });

    const isBoletobancarioEligible =
      paymentMethods.isEligible("boletobancario");

    if (!isBoletobancarioEligible) {
      showMessage({
        text: "Boleto Bancario is not eligible for the selected currency (BRL)",
        type: "error",
      });
      return;
    }

    // Setup Boleto Bancario payment flow
    await setupBoletobancarioPayment(sdkInstance, currencyCode);
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
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
 * Sets up Boleto Bancario payment fields and handlers
 * @param {Object} sdkInstance - PayPal SDK instance
 * @param {string} currencyCode - Currency code
 */
async function setupBoletobancarioPayment(sdkInstance, currencyCode) {
  // Create Boleto Bancario payment session
  const boletobancarioCheckout =
    sdkInstance.createBoletobancarioOneTimePaymentSession({
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
  const fullnameField = boletobancarioCheckout.createPaymentFields({
    type: "name",
  });

  const fullnameContainer = document.querySelector("#boletobancario-full-name");
  fullnameContainer.appendChild(fullnameField);

  // Create and render email field
  const emailField = boletobancarioCheckout.createPaymentFields({
    type: "email",
  });

  const emailContainer = document.querySelector("#boletobancario-email");
  emailContainer.appendChild(emailField);

  // Show the additional information fields
  document.querySelector("#custom-fields").removeAttribute("hidden");

  // Setup button click handler
  const boletobancarioButton = document.querySelector("#boletobancario-button");
  boletobancarioButton.removeAttribute("hidden");

  boletobancarioButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate additional billing fields
      const billingData = validateBillingAddress();

      // Validate the payment fields
      const valid = await boletobancarioCheckout.validate();

      if (valid) {
        console.log("Validation successful, starting payment flow...");
        // Start payment with popup presentation and billing data
        // Call the function to get the promise
        await boletobancarioCheckout.start(
          { presentationMode: "popup" },
          createBoletobancarioOrder(currencyCode, billingData),
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
 * Validates billing address and additional information
 * @returns {Object} Billing data
 * @throws {Error} If validation fails
 */
function validateBillingAddress() {
  const addressLine1 = document.querySelector("#address-line-1").value.trim();
  const addressLine2 = document.querySelector("#address-line-2").value.trim();
  const adminArea1 = document.querySelector("#admin-area-1").value.trim();
  const adminArea2 = document.querySelector("#admin-area-2").value.trim();
  const postalCode = document.querySelector("#postal-code").value.trim();
  const countryCode = document.querySelector("#country-code").value.trim();
  const taxId = document.querySelector("#tax-id").value.trim();
  const taxIdType = document.querySelector("#tax-id-type").value.trim();
  const expiryDate = document.querySelector("#expiry-date").value.trim();

  const errors = [];
  if (!addressLine1) errors.push("Address Line 1");
  if (!addressLine2) errors.push("Address Line 2");
  if (!adminArea1) errors.push("Admin Area 1");
  if (!adminArea2) errors.push("Admin Area 2");
  if (!postalCode) errors.push("Postal Code");
  if (!countryCode) errors.push("Country Code");
  if (!taxId) errors.push("Tax ID");
  if (!taxIdType) errors.push("Tax ID Type");
  if (!expiryDate) errors.push("Expiry Date");

  if (errors.length > 0) {
    const errorMessage = `The following fields are required: ${errors.join(", ")}`;
    throw new Error(errorMessage);
  }

  return {
    addressLine1,
    addressLine2,
    adminArea1,
    adminArea2,
    postalCode,
    countryCode,
    taxId,
    taxIdType,
    expiryDate,
  };
}

/**
 * Creates an order for Boleto Bancario payment with billing data
 * @param {string} currencyCode - Currency code (BRL)
 * @param {Object} billingData - Billing address and tax information
 * @returns {Promise<Object>} Order session options
 */
async function createBoletobancarioOrder(currencyCode, billingData) {
  try {
    console.log("Creating PayPal order for Boleto Bancario...");

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

    // Return order session options with billing data
    return {
      orderId,
      billingAddress: {
        addressLine1: billingData.addressLine1,
        addressLine2: billingData.addressLine2,
        adminArea2: billingData.adminArea2,
        adminArea1: billingData.adminArea1,
        postalCode: billingData.postalCode,
        countryCode: billingData.countryCode,
      },
      taxInfo: {
        taxId: billingData.taxId,
        taxIdType: billingData.taxIdType,
      },
      expiryDate: billingData.expiryDate,
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
