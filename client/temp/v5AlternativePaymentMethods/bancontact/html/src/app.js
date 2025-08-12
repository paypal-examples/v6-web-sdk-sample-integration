const v6Button = document.querySelector("#v6-paypal-button");
const v5ButtonContainer = document.querySelector("#v5-bancontact-button");
let showV6Button;
let showV5Button;

function showButtons() {
  if (showV6Button && showV5Button) {
    showV6Button();
    showV5Button();
  }
}

async function onV6PayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-payments"],
      pageType: "checkout",
    });

    const paypalPaymentSession = sdkInstance.createPayPalOneTimePaymentSession(
      paymentSessionOptions,
    );

    v6Button.addEventListener("click", async () => {
      await paypalPaymentSession.start(
        { presentationMode: "auto" },
        createOrder(),
      );
    });

    showV6Button = () => v6Button.removeAttribute("hidden");
    showButtons();
  } catch (error) {
    console.error(error);
  }
}

async function onV5PayPalWebSdkLoaded() {
  try {
    const fundingSource = v5Paypal.FUNDING.BANCONTACT;
    const standaloneButton = v5Paypal.Buttons({
      fundingSource,
      ...paymentSessionOptions,
    });

    if (standaloneButton.isEligible()) {
      standaloneButton.render(v5ButtonContainer);
      showV5Button = () => v5ButtonContainer.removeAttribute("hidden");
      showButtons();
    } else {
      console.log(`${fundingSource} is not eligible`);
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
