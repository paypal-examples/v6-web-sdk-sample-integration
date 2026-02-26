async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "GB", // Great Britain for Klarna testing
      components: ["klarna-payments"],
    });

    // Check if Klarna is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "GBP",
    });

    const isKlarnaEligible = paymentMethods.isEligible("klarna");

    if (isKlarnaEligible) {
      setupKlarnaPayment(sdkInstance);
    } else {
      showMessage({
        text: "Klarna is not eligible. Please ensure your buyer country is Great Britain and currency is GBP.",
        type: "error",
      });
      console.error("Klarna is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function setupKlarnaPayment(sdkInstance) {
  try {
    // Create Klarna checkout session
    const klarnaCheckout = sdkInstance.createKlarnaOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });

    // Setup payment fields
    setupPaymentFields(klarnaCheckout);

    // Setup button click handler
    setupButtonHandler(klarnaCheckout);
  } catch (error) {
    console.error("Error setting up Klarna payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function setupPaymentFields(klarnaCheckout) {
  // Create payment field for full name with optional prefill
  const fullNameField = klarnaCheckout.createPaymentFields({
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
  const emailField = klarnaCheckout.createPaymentFields({
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
  document.querySelector("#klarna-full-name").appendChild(fullNameField);
  document.querySelector("#klarna-email").appendChild(emailField);
}

function setupButtonHandler(klarnaCheckout) {
  const klarnaButton = document.querySelector("#klarna-button");
  klarnaButton.removeAttribute("hidden");

  klarnaButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate billing address first
      const billingData = validateBillingAddress();

      // Validate the payment fields
      const isValid = await klarnaCheckout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // get the promise reference by invoking createOrderWithBillingData()
        // do not await this async function since it can cause transient activation issues
        const createOrderPromise = createOrderWithBillingData(billingData);

        // Start payment flow with popup mode
        await klarnaCheckout.start(
          { presentationMode: "popup" },
          createOrderPromise,
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
        text: error.message || "An error occurred during payment. Please try again.",
        type: "error",
      });
    }
  });
}

function validateBillingAddress() {
  const addressLine1 = document.querySelector("#address-line-1").value.trim();
  const adminArea1 = document.querySelector("#admin-area-1").value.trim();
  const adminArea2 = document.querySelector("#admin-area-2").value.trim();
  const postalCode = document.querySelector("#postal-code").value.trim();
  const countryCode = document.querySelector("#country-code").value.trim();
  const phoneCountryCode = document.querySelector("#phone-country-code").value.trim();
  const phoneNationalNumber = document.querySelector("#phone-national-number").value.trim();

  const errors = [];
  if (!addressLine1) errors.push("Address Line 1");
  if (!adminArea1) errors.push("Admin Area 1");
  if (!adminArea2) errors.push("Admin Area 2");
  if (!postalCode) errors.push("Postal Code");
  if (!countryCode) errors.push("Country Code");
  if (!phoneCountryCode) errors.push("Phone Country Code");
  if (!phoneNationalNumber) errors.push("Phone National Number");

  if (errors.length > 0) {
    const errorMessage = `The following fields are required: ${errors.join(", ")}`;
    throw new Error(errorMessage);
  }

  return {
    addressLine1,
    adminArea1,
    adminArea2,
    postalCode,
    countryCode,
    phoneCountryCode,
    phoneNationalNumber,
  };
}

// Create PayPal order with billing data
async function createOrderWithBillingData(billingData) {
  try {
    console.log("Creating PayPal order...");

    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currencyCode: "GBP" }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    const { id } = await response.json();
    console.log("Order created with ID:", id);

    // Return order ID with billing data for the payment session
    return {
      orderId: id,
      billingAddress: {
        addressLine1: billingData.addressLine1,
        adminArea2: billingData.adminArea2,
        adminArea1: billingData.adminArea1,
        postalCode: billingData.postalCode,
        countryCode: billingData.countryCode,
      },
      phone: {
        nationalNumber: billingData.phoneNationalNumber,
        countryCode: billingData.phoneCountryCode,
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
