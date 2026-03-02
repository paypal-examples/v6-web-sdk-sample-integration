async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "BR", // Brazil for testing
      components: ["pix-international-payments"],
    });

    // Check if Pix International is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "BRL",
    });

    const isPixInternationalEligible = paymentMethods.isEligible("pix_international");

    if (isPixInternationalEligible) {
      setupPixInternationalPayment(sdkInstance);
    } else {
      showMessage({
        text: "Pix International is not eligible. Please ensure your configuration is correct.",
        type: "error",
      });
      console.error("Pix International is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function setupPixInternationalPayment(sdkInstance) {
  try {
    // Create Pix International checkout session
    const pixInternationalCheckout = sdkInstance.createPixInternationalOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });

    // Setup payment fields
    setupPaymentFields(pixInternationalCheckout);

    // Setup button click handler
    setupButtonHandler(pixInternationalCheckout);
  } catch (error) {
    console.error("Error setting up Pix International payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function setupPaymentFields(pixInternationalCheckout) {
  // Create payment field for full name with optional prefill
  const fullNameField = pixInternationalCheckout.createPaymentFields({
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

  // Create email field
  const emailField = pixInternationalCheckout.createPaymentFields({
    type: "email",
    value: "",
    style: {
      variables: {
        textColor: "#333333",
        colorTextPlaceholder: "#999999",
        fontFamily: "Verdana, sans-serif",
        fontSizeBase: "14px",
      },
    },
  });

  // Mount the fields to the containers
  document.querySelector("#pix-international-full-name").appendChild(fullNameField);
  document.querySelector("#pix-international-email").appendChild(emailField);
}

function setupButtonHandler(pixInternationalCheckout) {
  const pixInternationalButton = document.querySelector("#pix-international-button");
  pixInternationalButton.removeAttribute("hidden");

  pixInternationalButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate tax info first
      const taxInfo = validateTaxInfo();

      // Validate the payment fields
      const isValid = await pixInternationalCheckout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // get the promise reference by invoking createOrder()
        // do not await this async function since it can cause transient activation issues
        const createOrderPromise = createOrderWithTaxInfo(taxInfo);

        // Start payment flow with popup mode
        await pixInternationalCheckout.start(
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

function validateTaxInfo() {
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
async function createOrderWithTaxInfo(taxInfo) {
  try {
    console.log("Creating PayPal order...");
    const orderPayload = {
      intent: "CAPTURE",
      processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
      purchase_units: [
        {
          reference_id: "Reference ID 2",
          description: "Description of PU",
          custom_id: "Custom-ID1",
          soft_descriptor: "Purchase Descriptor",
          amount: {
            currency_code: "BRL",
            value: "230.05",
            breakdown: {
              item_total: {
                currency_code: "BRL",
                value: "180.05",
              },
              shipping: {
                currency_code: "BRL",
                value: "20.00",
              },
              handling: {
                currency_code: "BRL",
                value: "10.00",
              },
              tax_total: {
                currency_code: "BRL",
                value: "20.00",
              },
              insurance: {
                currency_code: "BRL",
                value: "10.00",
              },
              shipping_discount: {
                currency_code: "BRL",
                value: "10.00",
              },
            },
          },
          items: [
            {
              name: "Item 0",
              description: "Description 0",
              sku: "SKU - 0",
              url: "www.example.com",
              unit_amount: {
                currency_code: "BRL",
                value: "90.05",
              },
              tax: {
                currency_code: "BRL",
                value: "10.00",
              },
              quantity: "1",
              category: "PHYSICAL_GOODS",
            },
            {
              name: "Item 1",
              description: "Description 1",
              sku: "SKU 1",
              url: "www.example1.com",
              unit_amount: {
                currency_code: "BRL",
                value: "45.00",
              },
              tax: {
                currency_code: "BRL",
                value: "5.00",
              },
              quantity: "2",
              category: "PHYSICAL_GOODS",
            },
          ],
          shipping: {
            method: "Postal Service",
          },
        },
      ],
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

    // Return order ID with tax info for the payment session
    return {
      orderId: id,
      taxInfo: {
        taxId: taxInfo.taxId,
        taxIdType: taxInfo.taxIdType,
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
