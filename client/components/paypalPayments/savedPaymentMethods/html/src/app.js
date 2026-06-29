// Holds the vault configuration set by the buyer via the "Set" button.
const vaultConfig = {
  vaultId: "",
  targetCustomerId: "",
};

async function onPayPalWebSdkLoaded() {
  document
    .querySelector("#set-vault-config")
    .addEventListener("click", initializePayPal);

  await initializePayPal();
}

async function initializePayPal() {
  try {
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

    if (paymentMethods.isEligible("paypal") || !canBeVaulted) {
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
    renderAlert({
      type: "success",
      message: `Payment method successfuly updated; ${JSON.stringify(data)}`,
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

async function createOrder({ vaultId = vaultConfig.vaultId } = {}) {
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

  return { orderId: data.id };
}

function renderAlert({ type, message }) {
  const alertComponentElement = document.querySelector("alert-component");
  if (!alertComponentElement) {
    return;
  }

  alertComponentElement.setAttribute("type", type);
  alertComponentElement.innerText = message;
}
