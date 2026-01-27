async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["card-fields"],
    });

    const paymentMethods = await sdkInstance.findEligibleMethods();

    const isCardFieldsEligible = paymentMethods.isEligible("advanced_cards");
    if (isCardFieldsEligible) {
      await setupCardFields(sdkInstance);
    }
  } catch (err) {
    console.error("SDK init failed", err);
  }
}

async function setupCardFields(sdkInstance) {
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
  payButton.addEventListener("click", () => onPayClick(cardFieldsInstance));
}

async function onPayClick(cardFieldsInstance) {
  try {
    const orderId = await createOrder(); // returns a string id

    const { data, state } = await cardFieldsInstance.submit(orderId, {
      billingAddress: {
        postalCode: "95131",
      },
    });

    switch (state) {
      case "succeeded": {
        const { orderId, ...liabilityShift } = data;
        // 3DS may or may not have occurred; Use liabilityShift
        // to determine if the payment should be captured

        const orderData = await captureOrder({
          orderId: data.orderId,
        });
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

async function getBrowserSafeClientToken() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { accessToken } = await response.json();

  return accessToken; // pass as clienToken above
}

async function createOrder() {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-one-time-payment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const { id } = await response.json();

  return id; // return the string orderId
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
  const data = await response.json();

  return data;
}
