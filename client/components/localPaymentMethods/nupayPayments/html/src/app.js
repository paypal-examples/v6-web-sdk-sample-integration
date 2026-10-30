async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "BR", // Brazil for NuPay testing
      components: ["nupay-payments"],
    });

    // Check if NuPay is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "BRL",
    });

    const isNupayEligible = paymentMethods.isEligible("nupay");

    if (isNupayEligible) {
      configureNupayPayment(sdkInstance);
    } else {
      showMessage({
        text: "NuPay is not eligible. Please ensure your buyer country is Brazil and currency is BRL.",
        type: "error",
      });
      console.error("NuPay is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function configureNupayPayment(sdkInstance) {
  try {
    // Create NuPay checkout session
    const checkout = sdkInstance.createNupayOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });

    // Setup payment fields
    configurePaymentFields(checkout);

    // Setup button click handler
    configureButtonHandler(checkout);
  } catch (error) {
    console.error("Error setting up NuPay payment:", error);
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
  document.querySelector("#nupay-full-name").appendChild(fullNameField);
  document.querySelector("#nupay-email").appendChild(emailField);
}

function configureButtonHandler(checkout) {
  const button = document.querySelector("#nupay-button");
  button.removeAttribute("hidden");

  document.querySelector("#extra-fields").removeAttribute("hidden");

  button.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate extra fields (phone + tax info) first
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
  const phoneCountryCode = document
    .querySelector("#phone-country-code")
    .value.trim();
  const phoneNationalNumber = document
    .querySelector("#phone-national-number")
    .value.trim();
  const taxId = document.querySelector("#tax-id").value.trim();
  const taxIdType = document.querySelector("#tax-id-type").value.trim();

  const errors = [];
  if (!phoneCountryCode) errors.push("Phone Country Code");
  if (!phoneNationalNumber) errors.push("Phone National Number");
  if (!taxId) errors.push("Tax ID");
  if (!taxIdType) errors.push("Tax ID Type");

  if (errors.length > 0) {
    const errorMessage = `The following fields are required: ${errors.join(", ")}`;
    throw new Error(errorMessage);
  }

  return {
    phoneCountryCode,
    phoneNationalNumber,
    taxId,
    taxIdType,
  };
}

// Create PayPal order with phone + tax info data
async function createOrderWithExtraData(extraData) {
  try {
    console.log("Creating PayPal order for NuPay...");

    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currencyCode: "BRL",
          processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    const { id } = await response.json();
    console.log("Order created with ID:", id);

    // Return session options with orderId, phone, and tax info
    return {
      orderId: id,
      phone: {
        nationalNumber: extraData.phoneNationalNumber,
        countryCode: extraData.phoneCountryCode,
      },
      taxInfo: {
        taxId: extraData.taxId,
        taxIdType: extraData.taxIdType,
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
