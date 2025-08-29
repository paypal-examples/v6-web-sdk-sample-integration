async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-guest-payments"],
    });

    setupGuestPaymentButton(sdkInstance);
  } catch (error) {
    console.error(error);
  }
}

async function setupGuestPaymentButton(sdkInstance) {
  try {
    const eligiblePaymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "USD",
    });

    const paypalGuestPaymentSession =
      await sdkInstance.createPayPalGuestOneTimePaymentSession({
        onApprove,
        onCancel,
        onComplete,
        onError,
        onShippingAddressChange,
        onShippingOptionsChange,
      });

    document
      .getElementById("paypal-basic-card-button")
      .addEventListener("click", onClick);

    async function onClick() {
      try {
        const startOptions = {
          presentationMode: "auto",
        };
        await paypalGuestPaymentSession.start(startOptions, createOrder());
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function onApprove(data) {
  console.log("onApprove", data);
  const orderData = await captureOrder({
    orderId: data.orderId,
  });
  console.log("Capture result", orderData);
}

function onCancel(data) {
  console.log("onCancel", data);
}

function onComplete(data) {
  console.log("onComplete", data);
}

function onError(data) {
  console.log("onError", data);
}

/**
 * The shipping address change callback can be used to validate the buyer address, recalculate taxes, recalculate
 * shipping costs, and so on. In this example, we are displaying an error if the user selects a non-US address.
 */
function onShippingAddressChange(data) {
  console.log("onShippingAddressChange", data);

  const countryCode = data?.shippingAddress?.countryCode ?? "US";
  if (countryCode !== "US") {
    throw new Error(data?.errors?.COUNTRY_ERROR);
  }
}

/**
 * The shipping options change callback can be used to recalculate taxes, recalculate shipping costs, and so on. In
 * this example, we are displaying an error if the user selects the unavailable shipping method.
 */
function onShippingOptionsChange(data) {
  console.log("onShippingOptionsChange", data);

  const selectedShippingOption = data?.selectedShippingOption?.id;
  if (selectedShippingOption === "SHIP_UNV") {
    throw new Error(data?.errors?.METHOD_UNAVAILABLE);
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

  return accessToken;
}

async function createOrder() {
  const orderPayload = {
    intent: "CAPTURE",
    purchaseUnits: [
      {
        amount: {
          currencyCode: "USD",
          value: "10.00",
          breakdown: {
            itemTotal: {
              currencyCode: "USD",
              value: "10.00",
            },
          },
        },
        shipping: {
          options: [
            {
              id: "SHIP_FRE",
              label: "Free",
              type: "SHIPPING",
              selected: true,
              amount: {
                value: "0.00",
                currencyCode: "USD",
              },
            },
            {
              id: "SHIP_EXP",
              label: "Expedited",
              type: "SHIPPING",
              selected: false,
              amount: {
                value: "5.00",
                currencyCode: "USD",
              },
            },
            {
              id: "SHIP_UNV",
              label: "Unavailable",
              type: "SHIPPING",
              selected: false,
              amount: {
                value: "1000",
                currencyCode: "USD",
              },
            },
          ],
        },
      },
    ],
  };

  const response = await fetch(
    "/paypal-api/checkout/orders/create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload)
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
