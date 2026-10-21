async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "CO", // Colombia for Nequi testing
      components: ["nequi-payments"],
    });

    // Check if Nequi is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "COP",
    });

    const isNequiEligible = paymentMethods.isEligible("nequi");

    if (isNequiEligible) {
      configureNequiPayment(sdkInstance);
    } else {
      showMessage({
        text: "Nequi is not eligible. Please ensure your buyer country is Colombia and currency is COP.",
        type: "error",
      });
      console.error("Nequi is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function configureNequiPayment(sdkInstance) {
  try {
    // Create Nequi checkout session
    const checkout = sdkInstance.createNequiOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });

    // Setup payment fields
    configurePaymentFields(checkout);

    // Setup button click handler
    configureButtonHandler(checkout);
  } catch (error) {
    console.error("Error setting up Nequi payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function configurePaymentFields(checkout) {
  // Create payment field for full name with optional prefill
  const fullNameField = checkout.createPaymentFields({
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
  const emailField = checkout.createPaymentFields({
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
  document.querySelector("#nequi-full-name").appendChild(fullNameField);
  document.querySelector("#nequi-email").appendChild(emailField);
}

function configureButtonHandler(checkout) {
  const button = document.querySelector("#nequi-button");
  button.removeAttribute("hidden");

  document.querySelector("#extra-fields").removeAttribute("hidden");

  button.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate extra fields (phone + billing address) first
      const extraData = validateExtraFields();

      // Validate the payment fields (name and email)
      const isValid = await checkout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // Start payment flow with popup mode and extra data
        await checkout.start(
          { presentationMode: "auto" },
          createOrderWithExtraData(extraData),
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

function validateExtraFields() {
  const identificationType = document
    .querySelector("#identification-type")
    .value.trim();
  const identificationNumber = document
    .querySelector("#identification-number")
    .value.trim();
  const phoneCountryCode = document
    .querySelector("#phone-country-code")
    .value.trim();
  const phoneNationalNumber = document
    .querySelector("#phone-national-number")
    .value.trim();
  const addressLine1 = document.querySelector("#address-line-1").value.trim();
  const addressLine2 = document.querySelector("#address-line-2").value.trim();
  const adminArea1 = document.querySelector("#admin-area-1").value.trim();
  const adminArea2 = document.querySelector("#admin-area-2").value.trim();
  const postalCode = document.querySelector("#postal-code").value.trim();
  const countryCode = document.querySelector("#country-code").value.trim();

  const errors = [];
  if (!identificationType) errors.push("Identification Type");
  if (!identificationNumber) errors.push("Identification Number");
  if (!phoneCountryCode) errors.push("Phone Country Code");
  if (!phoneNationalNumber) errors.push("Phone National Number");
  if (!addressLine1) errors.push("Address Line 1");
  if (!adminArea1) errors.push("Admin Area 1");
  if (!adminArea2) errors.push("Admin Area 2");
  if (!postalCode) errors.push("Postal Code");
  if (!countryCode) errors.push("Country Code");

  if (errors.length > 0) {
    const errorMessage = `The following fields are required: ${errors.join(", ")}`;
    throw new Error(errorMessage);
  }

  return {
    identificationType,
    identificationNumber,
    phoneCountryCode,
    phoneNationalNumber,
    addressLine1,
    addressLine2,
    adminArea1,
    adminArea2,
    postalCode,
    countryCode,
  };
}

// Create PayPal order with phone + billing address data
async function createOrderWithExtraData(extraData) {
  try {
    console.log("Creating PayPal order for Nequi...");

    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currencyCode: "COP",
          processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    const { id } = await response.json();
    console.log("Order created with ID:", id);

    // Return session options with orderId, identification, phone, and billing address
    return {
      orderId: id,
      identification: {
        type: extraData.identificationType,
        idNumber: extraData.identificationNumber,
      },
      phone: {
        nationalNumber: extraData.phoneNationalNumber,
        countryCode: extraData.phoneCountryCode,
      },
      billingAddress: {
        addressLine1: extraData.addressLine1,
        addressLine2: extraData.addressLine2,
        adminArea1: extraData.adminArea1,
        adminArea2: extraData.adminArea2,
        postalCode: extraData.postalCode,
        countryCode: extraData.countryCode,
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
