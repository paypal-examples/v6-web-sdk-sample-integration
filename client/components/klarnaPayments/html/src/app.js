async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      testBuyerCountry: "GB", // United Kingdom for Klarna testing
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
        text: "Klarna is not eligible. Please ensure your buyer country and currency are supported.",
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

      // Validate the payment fields
      const isValid = await klarnaCheckout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // Collect billing address data from form
        const billingData = {
          orderId: await createOrderId(),
          billingAddress: {
            addressLine1: document.getElementById("address-line1").value,
            adminArea1: document.getElementById("admin-area1").value,
            adminArea2: document.getElementById("admin-area2").value,
            postalCode: document.getElementById("postal-code").value,
            countryCode: document.getElementById("country-code").value,
          },
          phone: {
            countryCode: document.getElementById("phone-country-code").value,
            nationalNumber: document.getElementById("phone-national-number")
              .value,
          },
        };

        // Validate billing address
        if (!validateBillingAddress(billingData)) {
          showMessage({
            text: "Please fill in all billing address fields correctly.",
            type: "error",
          });
          return;
        }

        // Start payment flow with popup mode
        await klarnaCheckout.start(
          { presentationMode: "popup" },
          Promise.resolve(billingData),
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
        text: "An error occurred during payment. Please try again.",
        type: "error",
      });
    }
  });
}

// Validate billing address data
function validateBillingAddress(billingData) {
  const { billingAddress, phone } = billingData;

  if (
    !billingAddress.addressLine1 ||
    !billingAddress.adminArea1 ||
    !billingAddress.adminArea2 ||
    !billingAddress.postalCode ||
    !billingAddress.countryCode ||
    !phone.countryCode ||
    !phone.nationalNumber
  ) {
    return false;
  }

  return true;
}

// Create PayPal order and return order ID
async function createOrderId() {
  try {
    console.log("Creating PayPal order...");

    const orderPayload = {
      intent: "AUTHORIZE",
      purchaseUnits: [
        {
          amount: {
            currencyCode: "GBP",
            value: "100.00",
          },
        },
      ],
      processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
    };

    const response = await fetch("/paypal-api/checkout/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    const { id } = await response.json();
    console.log("Order created with ID:", id);

    return id;
  } catch (error) {
    console.error("Error creating order:", error);
    showMessage({
      text: "Failed to create order. Please try again.",
      type: "error",
    });
    throw error;
  }
}

// Authorize order after approval
async function authorizeOrder(orderId) {
  try {
    console.log("Authorizing order:", orderId);

    const response = await fetch(
      `/paypal-api/checkout/orders/${orderId}/authorize`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to authorize order");
    }

    const data = await response.json();
    console.log("Order authorized successfully:", data);

    return data;
  } catch (error) {
    console.error("Error authorizing order:", error);
    throw error;
  }
}

// Handle successful payment approval
async function handleApprove(data) {
  console.log("Payment approved:", data);

  try {
    const result = await authorizeOrder(data.orderId);
    console.log("Authorization successful:", result);

    showMessage({
      text: `Payment successful! Order ID: ${data.orderId}. Authorization ID: ${result.purchase_units?.[0]?.payments?.authorizations?.[0]?.id || "N/A"}. Check console for details.`,
      type: "success",
    });
  } catch (error) {
    console.error("Authorization failed:", error);
    showMessage({
      text: "Payment approved but authorization failed.",
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

// Get client token from server
async function getBrowserSafeClientToken() {
  try {
    const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch client token");
    }

    const { accessToken } = await response.json();
    return accessToken;
  } catch (error) {
    console.error("Error fetching client token:", error);
    throw error;
  }
}

// Utility function to show messages to user
function showMessage({ text, type }) {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.className = `message ${type} show`;
}
