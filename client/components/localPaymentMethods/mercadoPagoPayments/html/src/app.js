async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "BR", // Mercado Pago testing
      components: ["mercado-pago-payments"],
    });

    // Check if Mercado Pago is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "BRL",
    });

    const isMercadoPagoEligible = paymentMethods.isEligible("mercado_pago");

    if (isMercadoPagoEligible) {
      configureMercadoPagoPayment(sdkInstance);
    } else {
      showMessage({
        text: "Mercado Pago is not eligible. Please ensure your buyer country is BR and currency is BRL.",
        type: "error",
      });
      console.error("Mercado Pago is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function configureMercadoPagoPayment(sdkInstance) {
  try {
    // Create Mercado Pago checkout session
    const mercadopagoCheckout = sdkInstance.createMercadoPagoOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });

    // Setup payment fields
    configurePaymentFields(mercadopagoCheckout);

    // Setup button click handler
    configureButtonHandler(mercadopagoCheckout);
  } catch (error) {
    console.error("Error setting up Mercado Pago payment:", error);
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
  document.querySelector("#mercadopago-full-name").appendChild(fullNameField);
  document.querySelector("#mercadopago-email").appendChild(emailField);
}

function configureButtonHandler(checkout) {
  const button = document.querySelector("#mercado-pago-button");
  button.removeAttribute("hidden");

  document.querySelector("#extra-fields").removeAttribute("hidden");

  button.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate extra fields (tax info) first
      const extraData = validateExtraFields();

      // Validate the payment fields
      const isValid = await checkout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // Start payment flow with popup mode and tax info
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
  const taxId = document.querySelector("#tax-id").value.trim();
  const taxIdType = document.querySelector("#tax-id-type").value.trim();

  const errors = [];
  if (!taxId) errors.push("Tax ID");
  if (!taxIdType) errors.push("Tax ID Type");

  if (errors.length > 0) {
    const errorMessage = `The following fields are required: ${errors.join(", ")}`;
    throw new Error(errorMessage);
  }

  return {
    taxId,
    taxIdType,
  };
}

// Create PayPal order with tax info
async function createOrderWithExtraData(extraData) {
  try {
    console.log("Creating PayPal order for Mercado Pago...");

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

    // Return session options with orderId and tax info
    return {
      orderId: id,
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
