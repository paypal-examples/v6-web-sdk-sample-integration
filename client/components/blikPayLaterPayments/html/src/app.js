async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      testBuyerCountry: "PL", // Poland for BLIK Pay Later testing
      components: ["blikpaylater-payments"],
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "PLN",
    });

    const isBlikPayLaterEligible = paymentMethods.isEligible("blik_pay_later");

    if (isBlikPayLaterEligible) {
      setupBlikPayLaterPayment(sdkInstance);
    } else {
      showMessage({
        text: "BLIK Pay Later is not eligible. Please ensure your buyer country is Poland and currency is PLN.",
        type: "error",
      });
      console.error("BLIK Pay Later is not eligible");
    }
  } catch (error) {
    console.error("Error initializing PayPal SDK:", error);
    showMessage({
      text: "Failed to initialize payment system. Please try again.",
      type: "error",
    });
  }
}

function setupBlikPayLaterPayment(sdkInstance) {
  try {
    const blikpaylaterCheckout =
      sdkInstance.createBlikPayLaterOneTimePaymentSession({
        onApprove: handleApprove,
        onCancel: handleCancel,
        onError: handleError,
      });

    setupPaymentFields(blikpaylaterCheckout);
    setupButtonHandler(blikpaylaterCheckout);
  } catch (error) {
    console.error("Error setting up BLIK Pay Later payment:", error);
    showMessage({
      text: "Failed to setup payment. Please refresh the page.",
      type: "error",
    });
  }
}

function setupPaymentFields(blikpaylaterCheckout) {
  const fullNameField = blikpaylaterCheckout.createPaymentFields({
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

  document
    .querySelector("#blikpaylater-full-name")
    .appendChild(fullNameField);
}

function setupButtonHandler(blikpaylaterCheckout) {
  const blikpaylaterButton = document.querySelector("#blikpaylater-button");
  blikpaylaterButton.removeAttribute("hidden");

  blikpaylaterButton.addEventListener("click", async () => {
    try {
      const isValid = await blikpaylaterCheckout.validate();

      if (isValid) {
        await blikpaylaterCheckout.start(
          { presentationMode: "popup" },
          createOrder(),
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

async function createOrder() {
  try {
    const response = await fetch(
      "/paypal-api/checkout/orders/create-order-for-one-time-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currencyCode: "PLN",
          processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    const { id } = await response.json();
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
    console.error("Failed to fetch order details:", error);
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
