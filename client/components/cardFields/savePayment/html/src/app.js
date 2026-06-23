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
  } catch (err) {
    renderAlert({
      type: "danger",
      message: "Failed to initialize the PayPal Web SDK",
    });
    console.error(error);
  }
}

async function setupCardFields(sdkInstance) {
  const cardFieldsInstance = sdkInstance.createCardFieldsSavePaymentSession();

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

  const payButton = document.querySelector("#save-payment-method-button");
  payButton.removeAttribute("hidden");
  payButton.addEventListener("click", () => onPayClick(cardFieldsInstance));
}

async function onPayClick(cardFieldsInstance) {
  try {
    const { vaultSetupToken } = await createVaultSetupToken();

    const { data, state } = await cardFieldsInstance.submit(vaultSetupToken);

    switch (state) {
      case "succeeded": {
        const paymentToken = await createPaymentToken({
          vaultSetupToken,
        });
        console.log("Payment method saved", paymentToken);
        console.log("vault setup token:", vaultSetupToken);

        renderAlert({
          type: "success",
          message: "Payment method saved!",
        });
        break;
      }
      case "canceled": {
        renderAlert({
          type: "warning",
          message: "Save payment flow canceled.",
        });
        break;
      }
      case "failed": {
        // Validation or processing failure. data.message may be present
        console.error("Card submission failed", data);
        renderAlert({
          type: "danger",
          message: `Validation or processing failure: ${data.message ?? ""}`,
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
    console.error("Payment flow error", error);
    // TODO: Show generic error and allow retry
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

async function createVaultSetupToken() {
  const response = await fetch(
    "/paypal-api/vault/create-setup-token-for-card-save-payment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to create vault setup token");
  }
  const { id } = await response.json();

  return { vaultSetupToken: id };
}

async function createPaymentToken({ vaultSetupToken }) {
  const response = await fetch(`/paypal-api/vault/payment-token/create`, {
    body: JSON.stringify({ vaultSetupToken }),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to create payment token");
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
