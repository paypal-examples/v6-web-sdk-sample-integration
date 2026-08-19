const COUNTRY_TO_CURRENCY = { US: "USD", MX: "MXN", BR: "BRL" };

let currentCurrencyCode;

async function onPayPalWebSdkLoaded() {
  try {
    // Using a clientToken (instead of a bare clientId) lets the Web SDK
    // derive the merchantId it needs internally from the token itself, so
    // there's no separate Merchant ID to configure for this example.
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["applepay-payments"],
      pageType: "checkout",
    });

    const countrySelect = document.getElementById("country-select");
    const currencyDisplay = document.getElementById("currency-display");
    currentCurrencyCode = COUNTRY_TO_CURRENCY[countrySelect.value];

    // The country/currency selector only affects what currency is used when
    // creating the order below; Apple Pay eligibility itself doesn't depend
    // on currency, so there's no need to re-run findEligibleMethods here.
    countrySelect.addEventListener("change", () => {
      currentCurrencyCode = COUNTRY_TO_CURRENCY[countrySelect.value];
      currencyDisplay.value = currentCurrencyCode;
    });

    const eligibility = await sdkInstance.findEligibleMethods();

    if (!eligibility.isEligible("basic_apple_pay")) {
      return renderAlert({
        type: "warning",
        message: "Basic Apple Pay is not eligible",
      });
    }

    const applePayPaymentSession =
      await sdkInstance.createBasicApplePayOneTimePaymentSession({
        onApprove: async ({ orderId }) => {
          console.log(`Payment approved, capturing order ${orderId}...`);
          const orderData = await captureOrder({ orderId });
          console.log(JSON.stringify(orderData, null, 2));
          renderAlert({
            type: "success",
            message: `Order captured successfully: ${orderId}`,
          });
        },
        onCancel: () => {
          renderAlert({ type: "info", message: "Payment cancelled" });
        },
        onError: (error) => {
          console.error(error);
          renderAlert({
            type: "danger",
            message: `Payment error: ${error.message ?? error}`,
          });
        },
      });

    if (!(await applePayPaymentSession.canMakePayments())) {
      return renderAlert({
        type: "warning",
        message: "This device cannot make Apple Pay payments",
      });
    }

    document.getElementById("payment-method-radio-group").hidden = false;
    configureApplePayButton(applePayPaymentSession);
  } catch (error) {
    console.error(error);
    renderAlert({
      type: "danger",
      message: `Failed to initialize Apple Pay: ${error.message ?? error}`,
    });
  }
}

function configureApplePayButton(applePayPaymentSession) {
  const applePayButton = createApplePayButton();
  applePayButton.addEventListener("click", () =>
    onApplePayButtonClick(applePayPaymentSession),
  );
  document
    .getElementById("apple-pay-button-container")
    .appendChild(applePayButton);
}

async function onApplePayButtonClick(applePayPaymentSession) {
  try {
    const checkoutSessionOptionsPromise = createOrder(currentCurrencyCode).then(
      ({ orderId }) => ({ orderId }),
    );
    // The Web SDK drives the entire Apple Pay sheet (merchant validation,
    // payment method selection, and authorization) on your behalf.
    await applePayPaymentSession.start({}, checkoutSessionOptionsPromise);
  } catch (error) {
    console.error(error);
    renderAlert({
      type: "danger",
      message: `Payment cancelled or failed: ${error.message ?? error}`,
    });
  }
}

function createApplePayButton() {
  const applePayButton = document.createElement("button");
  applePayButton.id = "apple-pay-button";
  applePayButton.textContent = "Checkout";
  return applePayButton;
}

async function getBrowserSafeClientToken() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const message = `Failed to get browser-safe client token: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`;
    renderAlert({ type: "danger", message });
    throw new Error(message);
  }

  const { accessToken } = await response.json();

  return accessToken;
}

async function createOrder(currencyCode) {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-one-time-payment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cart: [
          {
            // $20 amount (2 baseballs at $10 each)
            sku: "3xk9m4n2",
            quantity: 2,
          },
        ],
        currencyCode,
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    const message = `Failed to create order: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`;
    renderAlert({ type: "danger", message });
    throw new Error(message);
  }

  const { id } = await response.json();
  renderAlert({ type: "info", message: `Order successfully created: ${id}` });

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
    const errorBody = await response.text();
    const message = `Failed to capture order ${orderId}: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`;
    renderAlert({ type: "danger", message });
    throw new Error(message);
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
