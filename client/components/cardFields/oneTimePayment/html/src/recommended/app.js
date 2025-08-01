async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["card-fields"],
      pageType: "checkout",
    });

    // const paymentMethods = await sdkInstance.findEligibleMethods({
    //   currencyCode: "USD",
    // });

    // NOTE: Eligibility does not currently return card
    // if (paymentMethods.isEligible("card")) {
    //   setupCardFields(sdkInstance);
    // }
    setupCardFields(sdkInstance);
  } catch (error) {
    console.error(error);
  }
}

async function setupCardFields(sdkInstance) {
  const cardFieldsInstance =
    sdkInstance.createCardFieldsOneTimePaymentSession();

  const numberField = cardFieldsInstance.createCardFieldsComponent({
    type: "number",
    placeholder: "Enter a number:",
    ariaDescription: "card-number-field",
    ariaLabel: "some-values",
    style: {
      input: {
        color: "green",
      },
    },
    // SDK to take care of aria-invalid when the value is invalid on Change
  });
  const cvvField = cardFieldsInstance.createCardFieldsComponent({
    type: "cvv",
    placeholder: "Enter CVV:",
  });
  const expiryField = cardFieldsInstance.createCardFieldsComponent({
    type: "expiry",
    placeholder: "Enter Expiry:",
  });

  document.querySelector("#paypal-card-fields-number").appendChild(numberField);
  document.querySelector("#paypal-card-fields-cvv").appendChild(cvvField);
  document.querySelector("#paypal-card-fields-expiry").appendChild(expiryField);

  const payButton = document.querySelector("#save-payment-method-button");
  payButton.addEventListener("click", async () => {
    try {
      const orderId = await createOrder();
      const { data, state } = await cardFieldsInstance.submit(orderId, {
        billingAddress: {
          postalCode: "95131",
        },
      });

      switch (state) {
        case "succeeded": {
          const { orderId, ...liabilityShift } = data;
          const orderData = await captureOrder({
            orderId: data.orderId,
            headers: { "X-CSRF-TOKEN": "<%= csrfToken %>" },
          });
        }
        case "canceled": {
          // specifically for if buyer cancels 3DS modal
          const { orderId } = data;
        }
        case "failed": {
          const { orderId, message } = data;
        }
      }
    } catch (error) {
      console.error(error);
    }
  });
}

async function getBrowserSafeClientToken() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { accessToken } = await response.json();

  return accessToken;
}

async function createOrder() {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-with-sample-data",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
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
  const data = await response.json();

  return data;
}
