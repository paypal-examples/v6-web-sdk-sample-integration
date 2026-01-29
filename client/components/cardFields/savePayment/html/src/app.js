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
    console.error("SDK init failed", err);
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
  payButton.addEventListener("click", () => onPayClick(cardFieldsInstance));
}

async function onPayClick(cardFieldsInstance) {
  try {
    const { vaultSetupToken } = await createVaultSetupToken();

    const { data, state } = await cardFieldsInstance.submit(vaultSetupToken);

    switch (state) {
      case "succeeded": {
        const { vaultSetupToken, ...liabilityShift } = data;
        // 3DS may or may not have occurred; Use liabilityShift
        // to determine if the payment should be captured
        //

        const paymentToken = await createPaymentToken({
          vaultSetupToken,
        });
        console.log("Payment method saved", paymentToken);
        console.log("vault setup token:", vaultSetupToken);

        // TODO: show success UI, redirect, etc.
        break;
      }
      case "canceled": {
        // Buyer dismissed 3DS modal or canceled the flow
        // TODO: show non-blocking message & allow retry
        break;
      }
      case "failed": {
        // Validation or processing failure. data.message may be present
        console.error("Card submission failed", data);
        // TODO: surface error to buyer, allow retry
        break;
      }
      default: {
        // Future-proof for other states (e.g., pending)
        console.warn("Unhandled submit state", state, data);
      }
    }
  } catch (err) {
    console.error("Payment flow error", err);
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
  const data = await response.json();

  return data;
}
