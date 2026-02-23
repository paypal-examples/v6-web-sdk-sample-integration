async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "PH", // Philippines for Dragonpay testing
      components: ["dragonpay-payments"],
    });

    // Check if Dragonpay is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "PHP",
    });

    const isDragonpayEligible = paymentMethods.isEligible("dragonpay");

    if (isDragonpayEligible) {
      setupDragonpayPayment(sdkInstance);
    } else {
      showMessage({
        text: "Dragonpay is not eligible. Please ensure your buyer country is Philippines.",
        type: "error",
      });
      console.error("Dragonpay is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function setupDragonpayPayment(sdkInstance) {
  try {
    // Create Dragonpay checkout session
    const dragonpayCheckout = sdkInstance.createDragonpayOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });

    // Setup payment fields (name and email)
    setupPaymentFields(dragonpayCheckout);

    // Setup button click handler with phone validation
    setupButtonHandler(dragonpayCheckout);

    // Setup locale dropdown
    setupLocaleDropdown(sdkInstance);

    // Show phone fields
    document.querySelector("#phone-fields").removeAttribute("hidden");
  } catch (error) {
    console.error("Error setting up Dragonpay payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function setupPaymentFields(dragonpayCheckout) {
  // Check for prefill values from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const prefillName = urlParams.get("prefillName") === "true";
  const prefillEmail = urlParams.get("prefillEmail") === "true";

  // Set checkbox states
  if (prefillName) {
    document.querySelector("#prefill-full-name").checked = true;
  }
  if (prefillEmail) {
    document.querySelector("#prefill-email").checked = true;
  }

  // Create payment field for full name with optional prefill
  const fullNameField = dragonpayCheckout.createPaymentFields({
    type: "name",
    value: prefillName ? "John Doe" : "",
    style: {
      variables: {
        textColor: "#333333",
        colorTextPlaceholder: "#999999",
        fontFamily: "Verdana, sans-serif",
        fontSizeBase: "14px",
      },
    },
  });
  document.querySelector("#dragonpay-full-name").appendChild(fullNameField);

  // Create payment field for email with optional prefill
  const emailField = dragonpayCheckout.createPaymentFields({
    type: "email",
    value: prefillEmail ? "john.doe@example.com" : "",
    style: {
      variables: {
        textColor: "#333333",
        colorTextPlaceholder: "#999999",
        fontFamily: "Verdana, sans-serif",
        fontSizeBase: "14px",
      },
    },
  });
  document.querySelector("#dragonpay-email").appendChild(emailField);

  // Setup prefill checkboxes event listeners
  setupPrefillCheckboxes();
}

function setupPrefillCheckboxes() {
  const prefillNameCheckbox = document.querySelector("#prefill-full-name");
  prefillNameCheckbox.addEventListener("change", () => {
    const searchParams = new URLSearchParams(window.location.search);
    if (prefillNameCheckbox.checked) {
      searchParams.set("prefillName", "true");
    } else {
      searchParams.delete("prefillName");
    }
    window.location.href = window.location.pathname + "?" + searchParams.toString();
  });

  const prefillEmailCheckbox = document.querySelector("#prefill-email");
  prefillEmailCheckbox.addEventListener("change", () => {
    const searchParams = new URLSearchParams(window.location.search);
    if (prefillEmailCheckbox.checked) {
      searchParams.set("prefillEmail", "true");
    } else {
      searchParams.delete("prefillEmail");
    }
    window.location.href = window.location.pathname + "?" + searchParams.toString();
  });
}

function setupLocaleDropdown(sdkInstance) {
  document.querySelector("#update-locale").addEventListener("change", async (event) => {
    const newLocale = event.target.value;
    sdkInstance.updateLocale(newLocale);
    showMessage({
      text: `Locale updated to ${newLocale}`,
      type: "success",
    });
  });
}

function validatePhoneNumber() {
  const phoneCountryCode = document.querySelector("#phone-country-code").value.trim();
  const phoneNationalNumber = document.querySelector("#phone-national-number").value.trim();

  const errors = [];
  if (!phoneCountryCode) errors.push("Phone Country Code");
  if (!phoneNationalNumber) errors.push("Phone National Number");

  if (errors.length > 0) {
    const errorMessage = `The following fields are required: ${errors.join(", ")}`;
    showMessage({
      text: errorMessage,
      type: "error",
    });
    throw new Error(errorMessage);
  }

  return {
    phoneCountryCode,
    phoneNationalNumber,
  };
}

function setupButtonHandler(dragonpayCheckout) {
  const dragonpayButton = document.querySelector("#dragonpay-button");
  dragonpayButton.removeAttribute("hidden");

  dragonpayButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate phone number first
      const phoneData = validatePhoneNumber();

      // Validate the payment fields (name and email)
      const isValid = await dragonpayCheckout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // Create order with phone data - Dragonpay requires special flow
        const dragonpayCheckoutSessionOptionsPromise = createOrderWithPhone(phoneData);

        // Start payment flow with popup mode
        await dragonpayCheckout.start(
          { presentationMode: "popup" },
          dragonpayCheckoutSessionOptionsPromise,
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

// Create PayPal order for Dragonpay with phone data
async function createOrderWithPhone(phoneData) {
  try {
    console.log("Creating PayPal order for Dragonpay...");

    // Custom payload required by Dragonpay with processing_instruction
    // Note: PayPal API expects snake_case keys, value is 100 (not "10.00")
    const orderPayload = {
      intent: "CAPTURE",
      processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
      purchase_units: [
        {
          amount: {
            currency_code: "PHP",
            value: "100"
          },
          payee: {
            merchant_id: "PGT3FJDLUBZ3G"
          }
        }
      ]
    };

    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-with-custom-payload",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    const { id: orderId } = await response.json();
    console.log("Order created with ID:", orderId);

    // Return Dragonpay checkout session options with orderId and phone
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

// Get order details after approval
async function getOrder(orderId) {
  try {
    console.log("Fetching order details:", orderId);

    const response = await fetch(
      `/paypal-api/checkout/orders/${orderId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

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

// Handle successful payment
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

// Handle cancelled payment
function handleCancel(data) {
  console.log("Payment cancelled:", data);
  showMessage({
    text: "Payment was cancelled. Please try again if needed.",
    type: "info",
  });
}

// Handle payment errors
function handleError(error) {
  console.error("Payment error:", error);
  showMessage({
    text: "An error occurred during payment. Please try again.",
    type: "error",
  });
}

// Get browser safe client ID from server
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

// Show user message
function showMessage({ text, type }) {
  const messageContainer = document.querySelector("#message");
  messageContainer.textContent = text;
  messageContainer.className = `message ${type}`;
  console.log(`[${type.toUpperCase()}] ${text}`);
}
