async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "ID",
      components: ["kredivo-payments"],
    });
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "IDR",
    });
    const isEligible = paymentMethods.isEligible("kredivo");
    if (isEligible) {
      setupAPMPayment(sdkInstance);
    } else {
      showMessage({
        text: "Kredivo is not eligible. Please ensure your buyer country is Indonesia and currency is IDR.",
        type: "error",
      });
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function setupAPMPayment(sdkInstance) {
  try {
    const apmCheckout = sdkInstance.createKredivoOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });
    setupPaymentFields(apmCheckout);
    setupButtonHandler(apmCheckout);
  } catch (error) {
    console.error("Error setting up payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function setupPaymentFields(apmCheckout) {
  const fullNameField = apmCheckout.createPaymentFields({
    type: "name",
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
  const emailField = apmCheckout.createPaymentFields({
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
  document.querySelector("#kredivo-full-name").appendChild(fullNameField);
  document.querySelector("#kredivo-email").appendChild(emailField);
}

function setupButtonHandler(apmCheckout) {
  const apmButton = document.querySelector("#kredivo-button");
  apmButton.removeAttribute("hidden");
  document.querySelector("#phone-fields").removeAttribute("hidden");
  apmButton.addEventListener("click", async () => {
    try {
      const phoneData = validatePhoneFields();
      const isValid = await apmCheckout.validate();
      if (isValid) {
        await apmCheckout.start(
          { presentationMode: "popup" },
          createOrderWithPhone(phoneData),
        );
      } else {
        showMessage({
          text: "Please fill in all required fields correctly.",
          type: "error",
        });
      }
    } catch (error) {
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
  if (errors.length > 0)
    throw new Error(`The following fields are required: ${errors.join(", ")}`);
  return { phoneCountryCode, phoneNationalNumber };
}

async function createOrderWithPhone(phoneData) {
  try {
    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currencyCode: "IDR",
          processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
        }),
      },
    );
    if (!response.ok) throw new Error("Failed to create order");
    const { id } = await response.json();
    return {
      orderId: id,
      phone: {
        nationalNumber: phoneData.phoneNationalNumber,
        countryCode: phoneData.phoneCountryCode,
      },
    };
  } catch (error) {
    showMessage({
      text: "Failed to create order. Please try again.",
      type: "error",
    });
    throw error;
  }
}

async function getOrder(orderId) {
  const response = await fetch(`/paypal-api/checkout/orders/${orderId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch order details");
  return response.json();
}

async function handleApprove(data) {
  try {
    const orderDetails = await getOrder(data.orderId);
    console.log("Order details:", orderDetails);
    showMessage({
      text: `Payment successful! Order ID: ${data.orderId}. Check console for order details.`,
      type: "success",
    });
  } catch (error) {
    showMessage({
      text: "Transaction successful but failed to fetch order details.",
      type: "error",
    });
  }
}

function handleCancel(data) {
  console.log("Payment cancelled:", data);
  showMessage({
    text: "Payment was cancelled. You can try again.",
    type: "error",
  });
}
function handleError(error) {
  console.error("Payment error:", error);
  showMessage({
    text: "An error occurred during payment. Please try again or contact support.",
    type: "error",
  });
}

async function getBrowserSafeClientId() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-id", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch client id");
  const { clientId } = await response.json();
  return clientId;
}

function showMessage({ text, type }) {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.className = `message ${type} show`;
}
