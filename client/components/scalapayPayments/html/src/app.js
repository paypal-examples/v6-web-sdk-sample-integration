async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "FR", // France for Scalapay testing
      components: ["scalapay-payments"],
    });

    // Check if Scalapay is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "EUR",
    });

    const isScalapayEligible = paymentMethods.isEligible("scalapay");

    if (isScalapayEligible) {
      setupScalapayPayment(sdkInstance);
    } else {
      showMessage({
        text: "Scalapay is not eligible. Please ensure your buyer country is France and currency is EUR.",
        type: "error",
      });
      console.error("Scalapay is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function setupScalapayPayment(sdkInstance) {
  try {
    // Create Scalapay checkout session
    const scalapayCheckout = sdkInstance.createScalapayOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });

    // Setup payment fields
    setupPaymentFields(scalapayCheckout);

    // Setup button click handler
    setupButtonHandler(scalapayCheckout);
  } catch (error) {
    console.error("Error setting up Scalapay payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function setupPaymentFields(scalapayCheckout) {
  // Create payment field for full name with optional prefill
  const fullNameField = scalapayCheckout.createPaymentFields({
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
  const emailField = scalapayCheckout.createPaymentFields({
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
  document.querySelector("#scalapay-full-name").appendChild(fullNameField);
  document.querySelector("#scalapay-email").appendChild(emailField);
}

function setupButtonHandler(scalapayCheckout) {
  const scalapayButton = document.querySelector("#scalapay-button");
  scalapayButton.removeAttribute("hidden");

  scalapayButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate phone fields first
      const phoneData = validatePhoneFields();

      // Validate the payment fields (name and email)
      const isValid = await scalapayCheckout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // Start payment flow with popup mode and phone data
        await scalapayCheckout.start(
          { presentationMode: "popup" },
          createOrderWithPhone(phoneData),
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

function validatePhoneFields() {
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

// Create PayPal order with phone data
async function createOrderWithPhone(phoneData) {
  try {
    console.log("Creating PayPal order for Scalapay...");
    const orderPayload = {
      intent: "CAPTURE",
      processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
      purchase_units: [
        {
          amount: {
            breakdown: {
                item_total: {
                    currency_code: "EUR",
                    value: "24.10"
                },
                tax_total: {
                    currency_code: "EUR",
                    value: "1.00"
                }
            },
            currency_code: "EUR",
            value: "25.10"
          },
          items: [
            {
              name: "Shirt",
              quantity: "1",
              unit_amount: {
                currency_code: "EUR",
                value: "24.10"
              },
              tax: {
                currency_code: "EUR",
                value: "1.00"
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    const { id } = await response.json();
    console.log("Order created with ID:", id);

    // Return session options with orderId and phone data
    return {
      orderId: id,
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
