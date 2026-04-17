async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "FR", // France for Floa testing
      components: ["floa-payments"],
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "EUR",
    });

    const isFloaEligible = paymentMethods.isEligible("floa_pay");

    if (isFloaEligible) {
      setupFloaPayment(sdkInstance);
    } else {
      showMessage({
        text: "Floa is not eligible. Please ensure your buyer country is France and currency is EUR.",
        type: "error",
      });
      console.error("Floa is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function setupFloaPayment(sdkInstance) {
  try {
    const floaCheckout = sdkInstance.createFloaOneTimePaymentSession({
      onApprove: handleApprove,
      onCancel: handleCancel,
      onError: handleError,
    });

    setupPaymentFields(floaCheckout);
    setupButtonHandler(floaCheckout);
  } catch (error) {
    console.error("Error setting up Floa payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function setupPaymentFields(floaCheckout) {
  const fullNameField = floaCheckout.createPaymentFields({
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

  document.querySelector("#floa-full-name").appendChild(fullNameField);
}

function setupButtonHandler(floaCheckout) {
  const floaButton = document.querySelector("#floa-button");
  floaButton.removeAttribute("hidden");
  document.querySelector("#floa-extra-fields").removeAttribute("hidden");

  floaButton.addEventListener("click", async () => {
    try {
      const formData = validateExtraFields();
      const isValid = await floaCheckout.validate();

      if (isValid) {
        await floaCheckout.start(
          { presentationMode: "popup" },
          createOrderWithFormData(formData),
        );
      } else {
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
  const dateOfBirth = document.querySelector("#date-of-birth").value.trim();
  const numberOfInstallments = document
    .querySelector("#number-of-installments")
    .value.trim();

  const errors = [];
  if (!dateOfBirth) errors.push("Date of Birth");
  if (!numberOfInstallments) errors.push("Number of Installments");

  if (errors.length > 0) {
    throw new Error(`The following fields are required: ${errors.join(", ")}`);
  }

  return {
    dateOfBirth,
    numberOfInstallments: parseInt(numberOfInstallments, 10),
  };
}

async function createOrderWithFormData(formData) {
  try {
    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currencyCode: "EUR",
          processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    const { id } = await response.json();
    return {
      orderId: id,
      dateOfBirth: formData.dateOfBirth,
      numberOfInstallments: formData.numberOfInstallments,
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

async function getOrder(orderId) {
  const response = await fetch(`/paypal-api/checkout/orders/${orderId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch order details");
  }

  return response.json();
}

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
    showMessage({
      text: "Transaction successful but failed to fetch order details.",
      type: "error",
    });
  }
}

function handleCancel(data) {
  console.log("Payment cancelled:", data);
  showMessage({ text: "Payment was cancelled. You can try again.", type: "error" });
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

  if (!response.ok) {
    throw new Error("Failed to fetch client id");
  }

  const { clientId } = await response.json();
  return clientId;
}

function showMessage({ text, type }) {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.className = `message ${type} show`;
}
