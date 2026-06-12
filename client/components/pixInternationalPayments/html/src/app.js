async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "BR", // Brazil for Pix International testing
      components: ["pix-international-payments"],
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "BRL",
    });

    const isPixInternationalEligible =
      paymentMethods.isEligible("pix_international");

    if (isPixInternationalEligible) {
      setupPixInternationalPayment(sdkInstance);
    } else {
      showMessage({
        text: "Pix International is not eligible. Please ensure your buyer country is Brazil and currency is BRL.",
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
    const pixInternationalCheckout =
      sdkInstance.createPixInternationalOneTimePaymentSession({
        onApprove: handleApprove,
        onCancel: handleCancel,
        onError: handleError,
      });

    setupPaymentFields(pixInternationalCheckout);
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
  const fullNameField = pixInternationalCheckout.createPaymentFields({
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

  document
    .querySelector("#pix-international-full-name")
    .appendChild(fullNameField);
  document.querySelector("#pix-international-email").appendChild(emailField);
}

function setupButtonHandler(pixInternationalCheckout) {
  const pixInternationalButton = document.querySelector(
    "#pix-international-button",
  );
  pixInternationalButton.removeAttribute("hidden");
  document.querySelector("#tax-fields").removeAttribute("hidden");

  pixInternationalButton.addEventListener("click", async () => {
    try {
      const taxInfo = validateTaxInfo();
      const isValid = await pixInternationalCheckout.validate();

      if (isValid) {
        await pixInternationalCheckout.start(
          { presentationMode: "popup" },
          createOrderWithTaxInfo(taxInfo),
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

function validateTaxInfo() {
  const taxId = document.querySelector("#tax-id").value.trim();
  const taxIdType = document.querySelector("#tax-id-type").value.trim();

  const errors = [];
  if (!taxId) errors.push("Tax ID");
  if (!taxIdType) errors.push("Tax ID Type");

  if (errors.length > 0) {
    throw new Error(`The following fields are required: ${errors.join(", ")}`);
  }

  return { taxId, taxIdType };
}

async function createOrderWithTaxInfo(taxInfo) {
  try {
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
