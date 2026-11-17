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
      configurePayPalButton(sdkInstance);
    }
  } catch (error) {
    console.error(error);
  }
}

// Add a country code here (for example "US") to try the reject path.
const BLOCKED_COUNTRY_CODES = [];

const paymentSessionOptions = {
  // Called with the buyer's billing address: adminArea1, adminArea2,
  // countryCode and postalCode, each a string or null. Resolve to accept the
  // address. To reject it, throw an Error whose message is one of the values
  // in `errors` (ADDRESS_ERROR, COUNTRY_ERROR, POSTAL_ERROR, REGION_ERROR).
  // Any other message shows the buyer a generic error instead.
  async onBillingAddressChange({ billingAddress, errors }) {
    // Fields can be missing if the buyer has no usable profile address.
    const { countryCode } = billingAddress ?? {};
    if (countryCode && BLOCKED_COUNTRY_CODES.includes(countryCode)) {
      renderAlert({
        type: "danger",
        message: `onBillingAddressChange() rejected the billing address: ${errors.COUNTRY_ERROR}`,
      });
      throw new Error(errors.COUNTRY_ERROR);
    }

    renderAlert({
      type: "info",
      message: `onBillingAddressChange() accepted the billing address: ${JSON.stringify(billingAddress)}`,
    });
  },
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
    const { paymentTokenId, customerId } = createPaymentTokenResponse;
    renderAlert({
      type: "success",
      message: `Vaulted! Use these for the saved payment methods flow — customerId: ${customerId} | paymentTokenId (vaultId): ${paymentTokenId}`,
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

async function configurePayPalButton(sdkInstance) {
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
  if (!response.ok) {
    throw new Error("Failed to fetch client token");
  }
  const { accessToken } = await response.json();

  return accessToken;
}

async function createVaultSetupToken() {
  const response = await fetch(
    "/paypal-api/vault/create-setup-token-for-paypal-save-payment",
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
