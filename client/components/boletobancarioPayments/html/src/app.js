// Show user message
function showMessage({ text, type }) {
  const messageContainer = document.querySelector("#message");
  messageContainer.textContent = text;
  messageContainer.className = `message ${type}`;
  console.log(`[${type.toUpperCase()}] ${text}`);
}

async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      components: ["boletobancario-payments"],
      testBuyerCountry: "BR"
    });
    
    setupPaymentFields(sdkInstance);
  } catch (error) {
    console.error("Failed to load PayPal SDK:", error);
    showMessage({ text: `Error: ${error.message}`, type: "error" });
  }
}

// Expose to global scope for onload callback - must be done immediately
window.onPayPalWebSdkLoaded = onPayPalWebSdkLoaded;

function setupPaymentFields(sdkInstance) {
  const urlParams = new URLSearchParams(window.location.search);
  const prefillName = urlParams.get("prefillName") === "true";
  const prefillEmail = urlParams.get("prefillEmail") === "true";
  
  const prefillNameCheckbox = document.querySelector("#prefill-full-name");
  if (prefillName) {
    prefillNameCheckbox.checked = true;
  }
  
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
  if (prefillEmail) {
    prefillEmailCheckbox.checked = true;
  }
  
  prefillEmailCheckbox.addEventListener("change", () => {
    const searchParams = new URLSearchParams(window.location.search);
    if (prefillEmailCheckbox.checked) {
      searchParams.set("prefillEmail", "true");
    } else {
      searchParams.delete("prefillEmail");
    }
    window.location.href = window.location.pathname + "?" + searchParams.toString();
  });

  const boletobancarioCheckout = sdkInstance.createBoletobancarioOneTimePaymentSession({
    onApprove: handleApprove,
    onCancel: handleCancel,
    onError: handleError
  });

  const fullnameField = boletobancarioCheckout.createPaymentFields({
    type: "name",
    value: prefillName ? "John Doe" : undefined
  });

  document.querySelector("#boletobancario-full-name").appendChild(fullnameField);

  const emailField = boletobancarioCheckout.createPaymentFields({
    type: "email",
    value: prefillEmail ? "john.doe@example.com" : undefined
  });

  document.querySelector("#boletobancario-email").appendChild(emailField);

  setupButtonHandler(boletobancarioCheckout);
}

function setupButtonHandler(boletobancarioCheckout) {
  const boletobancarioButton = document.querySelector("#boletobancario-button");
  const customFieldsContainer = document.querySelector("#custom-fields");
  
  boletobancarioButton.removeAttribute("hidden");
  customFieldsContainer.removeAttribute("hidden");
  
  boletobancarioButton.addEventListener("click", async () => {
    try {
      const billingData = validateBillingAddress();
      const valid = await boletobancarioCheckout.validate();
      
      if (valid) {
        showMessage({ text: "Creating order...", type: "info" });
        await boletobancarioCheckout.start(
          { presentationMode: "popup" },
          createOrderWithBillingData(billingData)
        );
      } else {
        showMessage({ text: "Validation failed: Please fill in all required fields", type: "error" });
      }
    } catch (error) {
      console.error("Payment error:", error);
      showMessage({ text: error.message || "Validation failed", type: "error" });
    }
  });
}

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
    showMessage({ text: errorMessage, type: "error" });
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
    expiryDate
  };
}

async function createOrderWithBillingData(billingData) {
  try {
    const orderPayload = {
      intent: "CAPTURE",
      processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
      purchase_units: [{
        amount: {
          currency_code: "BRL",
          value: "10.00"
        }
      }]
    };

    const response = await fetch("/paypal-api/checkout/orders/create-order-with-custom-payload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create order: ${response.statusText}`);
    }

    const orderData = await response.json();
    showMessage({ text: `Order created: ${orderData.id}`, type: "success" });
    
    const {
      addressLine1,
      addressLine2,
      adminArea1,
      adminArea2,
      postalCode,
      countryCode,
      taxId,
      taxIdType,
      expiryDate
    } = billingData;
    
    return {
      orderId: orderData.id,
      billingAddress: {
        addressLine1,
        addressLine2,
        adminArea2,
        adminArea1,
        postalCode,
        countryCode
      },
      taxInfo: {
        taxId,
        taxIdType
      },
      expiryDate
    };
  } catch (error) {
    console.error("Error creating order:", error);
    showMessage({ text: `Error creating order: ${error.message}`, type: "error" });
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

function handleCancel(data) {
  console.log("Payment cancelled:", data);
  const message = data?.orderId ? `Payment cancelled. Order ID: ${data.orderId}` : "Payment cancelled";
  showMessage({ text: message, type: "info" });
}

function handleError(data) {
  console.error("Payment error:", data);
  showMessage({ text: `Error: ${JSON.stringify(data, null, 2)}`, type: "error" });
}

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
