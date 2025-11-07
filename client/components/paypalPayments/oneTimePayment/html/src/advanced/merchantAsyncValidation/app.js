async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-payments"],
      pageType: "checkout",
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "USD",
    });

    if (paymentMethods.isEligible("paypal")) {
      setupPayPalButton(sdkInstance);
    }
  } catch (error) {
    console.error(error);
  }
}

const paymentSessionOptions = {
  async onApprove(data) {
    console.log("onApprove", data);
    const orderData = await captureOrder({
      orderId: data.orderId,
    });
    console.log("Capture result", orderData);
  },
  onCancel(data) {
    console.log("onCancel", data);
  },
  onError(error) {
    console.log("onError", error);
  },
};

async function setupPayPalButton(sdkInstance) {
  const paypalPaymentSession = sdkInstance.createPayPalOneTimePaymentSession(
    paymentSessionOptions,
  );

  const paypalButton = document.querySelector("#paypal-button");
  paypalButton.removeAttribute("hidden");

  // Async promise to be passed into .start()
  async function validateAndCreateOrder() {
    // Run validation and order creation concurrently for better performance
    // If order creation depends on validation results, switch to sequential execution
    const [validationResult, createOrderResult] = await Promise.all([
      runAsyncValidation(),
      createOrder(),
    ]);

    return createOrderResult;
  }

  paypalButton.addEventListener("click", async () => {
    hideError();

    try {
      const createOrderPromise = validateAndCreateOrder();
      await paypalPaymentSession.start(
        {
          presentationMode: "auto",
          loadingScreen: { label: "connecting" },
        },
        createOrderPromise,
      );
    } catch (error) {
      console.error(error);
      showError(error.message);
    }
  });
}

// Async validation logic - customize this function for your validation needs
async function runAsyncValidation() {
  const delayInput = document.getElementById("validation-delay");
  const passCheckbox = document.getElementById("validation-pass");

  const delay = parseInt(delayInput.value) || 0;
  const shouldPass = passCheckbox.checked;

  console.log(`Running async validation with ${delay}ms delay...`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldPass) {
        resolve("Validation successful");
      } else {
        reject(new Error("Validation failed."));
      }
    }, delay);
  });
}

function showError(message) {
  const errorDiv = document.querySelector(".error-display");
  errorDiv.textContent = message;
  errorDiv.classList.add("show");
}

function hideError() {
  const errorDiv = document.querySelector(".error-display");
  errorDiv.classList.remove("show");
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
