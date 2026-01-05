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
      paymentFlow: "VAULT_WITHOUT_PAYMENT",
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
    renderAlert({
      type: "success",
      message: `Vault Setup Token successfully approved! ${JSON.stringify(data)}`,
    });
    const createPaymentTokenResponse = await createPaymentToken(
      data.vaultSetupToken,
    );
    console.log("Create payment token response: ", createPaymentTokenResponse);
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

async function setupPayPalButton(sdkInstance) {
  const paypalPaymentSession = sdkInstance.createPayPalSavePaymentSession(
    paymentSessionOptions,
  );

  const paypalButton = document.querySelector("#paypal-button");
  paypalButton.removeAttribute("hidden");

  paypalButton.addEventListener("click", async () => {
    try {
      // get the promise reference by invoking createVaultSetupToken()
      // do not await this async function since it can cause transient activation issues
      const createVaultSetupTokenPromise = createVaultSetupToken();
      await paypalPaymentSession.start(
        { presentationMode: "auto" },
        createVaultSetupTokenPromise,
      );
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

async function createVaultSetupToken() {
  const response = await fetch("/paypal-api/vault/setup-token/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { id } = await response.json();
  renderAlert({
    type: "info",
    message: `Vault Setup Token successfully created: ${id}`,
  });

  return { vaultSetupToken: id };
}

async function createPaymentToken(vaultSetupToken) {
  const response = await fetch("/paypal-api/vault/payment-token/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ vaultSetupToken }),
  });
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
