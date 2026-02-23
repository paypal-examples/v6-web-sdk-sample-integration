async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "DE", // Germany for Skrill testing
      components: ["skrill-payments"],
    });

    // Check if Skrill is eligible
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "EUR",
    });

    const isSkrillEligible = paymentMethods.isEligible("skrill");

    if (isSkrillEligible) {
      setupSkrillPayment(sdkInstance);
    } else {
      showMessage({
        text: "Skrill is not eligible. Please ensure your buyer country is Germany.",
        type: "error",
      });
      console.error("Skrill is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function setupSkrillPayment(sdkInstance) {
  try {
    // Create Skrill checkout session
    const skrillCheckout = sdkInstance.createSkrillOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });

    // Setup payment fields
    setupPaymentFields(skrillCheckout);

    // Setup button click handler
    setupButtonHandler(skrillCheckout);

    // Setup locale dropdown
    setupLocaleDropdown(sdkInstance);
  } catch (error) {
    console.error("Error setting up Skrill payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function setupPaymentFields(skrillCheckout) {
  // Check for prefill values from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const prefillName = urlParams.get("prefillName") === "true";

  // Set checkbox state
  if (prefillName) {
    document.querySelector("#prefill-full-name").checked = true;
  }

  // Create payment field for full name with optional prefill
  const fullNameField = skrillCheckout.createPaymentFields({
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
  document.querySelector("#skrill-full-name").appendChild(fullNameField);

  // Setup prefill checkbox event listener
  setupPrefillCheckbox();
}

function setupPrefillCheckbox() {
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

function setupButtonHandler(skrillCheckout) {
  const skrillButton = document.querySelector("#skrill-button");
  skrillButton.removeAttribute("hidden");

  skrillButton.addEventListener("click", async () => {
    try {
      console.log("Validating payment fields...");

      // Validate the payment fields (name)
      const isValid = await skrillCheckout.validate();

      if (isValid) {
        console.log("Validation successful, starting payment flow...");

        // get the promise reference by invoking createOrder()
        // do not await this async function since it can cause transient activation issues
        const createOrderPromise = createOrder();

        // Start payment flow with popup mode
        await skrillCheckout.start(
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

// Create PayPal order for Skrill with custom payload
async function createOrder() {
  try {
    console.log("Creating PayPal order for Skrill...");

    // Custom payload required by Skrill with processing_instruction and merchant_id
    // Note: PayPal API expects snake_case keys
    const orderPayload = {
      intent: "CAPTURE",
      processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: "10.00"
          },
          payee: {
            merchant_id: "3BT8586RFAFYQ"
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

    const { id } = await response.json();
    console.log("Order created with ID:", id);

    return { orderId: id };
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
