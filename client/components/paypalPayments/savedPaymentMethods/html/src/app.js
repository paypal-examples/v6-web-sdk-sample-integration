// Holds the vault configuration set by the buyer via the "Set" button.
const vaultConfig = {
  vaultId: "",
  targetCustomerId: "",
};

// Set when the buyer approves an order through the saved payment method
// component. The submit button captures this order instead of creating
// a new one.
let approvedOrderId = null;

async function onPayPalWebSdkLoaded() {
  document
    .querySelector("#set-vault-config")
    .addEventListener("click", initializePayPal);

  document
    .querySelector("#submit-button")
    .addEventListener("click", onSubmitOrder);

  await initializePayPal();
}

async function initializePayPal() {
  try {
    // Changing the vault configuration invalidates any order approved
    // under the previous configuration.
    approvedOrderId = null;

    vaultConfig.vaultId = document.querySelector("#vault-id").value.trim();
    vaultConfig.targetCustomerId = document
      .querySelector("#target-customer-id")
      .value.trim();

    const clientToken = await getBrowserSafeClientToken({
      targetCustomerId: vaultConfig.targetCustomerId,
      vaultId: vaultConfig.vaultId,
    });
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-saved-payment-methods", "paypal-messages"]
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "USD",
    });

    const { canBeVaulted } = paymentMethods.getDetails("paypal");

    if (paymentMethods.isEligible("paypal") && canBeVaulted) {
      configurePayPalButton(sdkInstance);
    }
  } catch (error) {
    console.error(error);
  }
}

const paymentSessionOptions = {
  commit: false,
  async onApprove(data) {
    console.log("onApprove", data);
    approvedOrderId = data.orderId;
    renderAlert({
      type: "success",
      message: `Payment method successfully updated for order ${data.orderId} — click "Submit Order" to capture it. ${JSON.stringify(data)}`,
    });
  },
  onCancel(data) {
    renderAlert({ type: "warning", message: "onCancel() callback called" });
    console.log("onCancel", data);
  },
  onError(error) {
    renderAlert({
      type: "danger",
      message: `onError() callback called: ${error}`,
    });
    console.log("onError", error);
  },
};

// Tracks the active session so the click handler (attached once) always
// uses the most recently configured SDK instance.
let editSavedPaymentSession;

async function configurePayPalButton(sdkInstance) {
  editSavedPaymentSession = sdkInstance.createPayPalEditSavedPaymentSession(
    paymentSessionOptions,
  );

  const savedPaymentMethodComponent = document.querySelector("#saved-payment-method");
  savedPaymentMethodComponent.removeAttribute("hidden");

  if (savedPaymentMethodComponent.dataset.listenerAttached) {
    return;
  }
  savedPaymentMethodComponent.dataset.listenerAttached = "true";

  savedPaymentMethodComponent.addEventListener("click", async () => {
    try {
      // get the promise reference by invoking createOrder()
      // do not await this async function since it can cause transient activation issues
      //
      // The order for the popup flow must NOT include the vault ID:
      // creating an order with payment_source.paypal.vault_id charges it
      // immediately (COMPLETED), which the buyer-approval popup can't
      // work with. The session resolves the saved payment method from
      // the client token instead.
      const createOrderPromise = createOrder();
      await editSavedPaymentSession.start(
        { presentationMode: "auto" },
        createOrderPromise
      );
    } catch (error) {
      console.error(error);
    }
  });

  // Set up credit messaging
  sdkInstance.createPayPalMessages({
    buyerCountry: "US",
    currencyCode: "USD",
  });
}

async function getBrowserSafeClientToken({ targetCustomerId, vaultId } = {}) {
  const queryParams = new URLSearchParams();
  if (targetCustomerId) {
    queryParams.append("targetCustomerId", targetCustomerId);
  }
  if (vaultId) {
    queryParams.append("vaultId", vaultId);
  }

  const response = await fetch(`/paypal-api/auth/browser-safe-client-token?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch client token");
  }
  const { accessToken } = await response.json();

  return accessToken;
}

async function createOrder({ vaultId } = {}) {
  const body = {};
  if (vaultId) {
    body.vaultId = vaultId;
  }

  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-paypal-saved-payment-methods",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Order creation failed ${data ? JSON.stringify(data) : ""}`,
    );
  }

  renderAlert({
    type: "info",
    message: `Order successfully created: ${data.id}`,
  });

  // `status` and `responseBody` are extra fields consumed by
  // onSubmitOrder() — the payment session only reads `orderId`.
  return { orderId: data.id, status: data.status, responseBody: data };
}

async function onSubmitOrder() {
  const submitButton = document.querySelector("#submit-button");
  submitButton.disabled = true;

  try {
    if (!approvedOrderId && !vaultConfig.vaultId) {
      renderAlert({
        type: "warning",
        message:
          "No order to submit — set a vault ID, or click the saved payment method to approve an order first.",
      });
      return;
    }

    let orderId = approvedOrderId;
    let captureData = null;

    if (!orderId) {
      // Creating an order with a vault ID charges the saved payment
      // method in the same call, so the order can come back COMPLETED
      // with nothing left to capture.
      const createResult = await createOrder({ vaultId: vaultConfig.vaultId });
      orderId = createResult.orderId;
      if (createResult.status === "COMPLETED") {
        captureData = createResult.responseBody;
      }
    }

    if (!captureData) {
      captureData = await captureOrder({ orderId });
    }

    approvedOrderId = null;
    console.log("Capture result", captureData);
    renderAlert({
      type: "success",
      message: `Order successfully captured! ${JSON.stringify(captureData)}`,
    });
  } catch (error) {
    console.error(error);
    renderAlert({
      type: "danger",
      message: `Order submit failed: ${error.message}`,
    });
  } finally {
    submitButton.disabled = false;
  }
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

  if (!response.ok) {
    throw new Error(
      `Order capture failed ${data ? JSON.stringify(data) : ""}`,
    );
  }

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
