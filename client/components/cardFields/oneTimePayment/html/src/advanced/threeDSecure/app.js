async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      components: ["card-fields"],
    });

    const paymentMethods = await sdkInstance.findEligibleMethods();

    const isCardFieldsEligible = paymentMethods.isEligible("advanced_cards");
    if (isCardFieldsEligible) {
      setupCardFields(sdkInstance);
    }
  } catch (error) {
    renderAlert({
      type: "danger",
      message: "Failed to initialize the PayPal Web SDK",
    });
    console.error(error);
  }
}

function setupCardFields(sdkInstance) {
  const cardFieldsInstance =
    sdkInstance.createCardFieldsOneTimePaymentSession();

  const numberField = cardFieldsInstance.createCardFieldsComponent({
    type: "number",
    placeholder: "Card Number",
  });

  const expiryField = cardFieldsInstance.createCardFieldsComponent({
    type: "expiry",
    placeholder: "MM/YY",
  });

  const cvvField = cardFieldsInstance.createCardFieldsComponent({
    type: "cvv",
    placeholder: "CVV",
  });

  document.querySelector("#paypal-card-fields-number").appendChild(numberField);
  document.querySelector("#paypal-card-fields-cvv").appendChild(cvvField);
  document.querySelector("#paypal-card-fields-expiry").appendChild(expiryField);

  const payButton = document.querySelector("#pay-button");
  payButton.removeAttribute("hidden");
  payButton.addEventListener("click", () => onPayClick(cardFieldsInstance));
}

async function onPayClick(cardFieldsInstance) {
  try {
    const { orderId } = await createOrder();

    const { data, state } = await cardFieldsInstance.submit(orderId, {
      billingAddress: {
        postalCode: "95131",
      },
    });

    switch (state) {
      case "succeeded": {
        const orderData = await captureOrder({
          orderId,
        });

        renderAlert({
          type: "success",
          message: "Order successfully captured!",
        });
        console.log("Capture result", orderData);
        break;
      }
      case "canceled": {
        // Buyer dismissed 3DS modal or canceled the flow
        renderAlert({
          type: "warning",
          message: "Payment canceled.",
        });
        break;
      }
      case "failed": {
        // Validation or processing failure
        console.error("Card submission failed", data);

        const { message, liabilityShift } = data;
        renderAlert({
          type: "danger",
          message: liabilityShift
            ? `Payment failed 3D Secure check: "liabilityShift: ${liabilityShift}"`
            : `Validation or processing failure: ${message ?? ""}`,
        });
        break;
      }
      default: {
        // Future-proof for other states (e.g., pending)
        console.warn("Unhandled submit state", state, data);
      }
    }
  } catch (error) {
    renderAlert({
      type: "danger",
      message: `Payment flow error: ${error.message}`,
    });
  }
}

async function getBrowserSafeClientId() {
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
}

async function createOrder() {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-card-one-time-payment-with-3ds",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to create order");
  }
  const { id } = await response.json();

  return { orderId: id };
}

async function captureOrder({ orderId }) {
  const response = await fetch(
    `/paypal-api/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to capture order");
  }
  const data = await response.json();

  return data;
}

function renderAlert({ type, message }) {
  const alertComponentElement = document.querySelector("alert-component");
  if (!alertComponentElement) {
    return;
  }

  alertComponentElement.setAttribute("type", type);
  alertComponentElement.innerText = message;
}
