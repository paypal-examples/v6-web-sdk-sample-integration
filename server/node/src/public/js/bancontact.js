const v6Button = document.querySelector("#v6-paypal-button");
const v5Button = document.querySelector("#v5-bancontact-button");
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
    const clientToken = document.querySelector(
      'script[src="/js/bancontact.js"]',
    )?.dataset?.clientToken;
    const sdkInstance = await window.paypal.v6.createInstance({
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
    const fundingSource = paypal.FUNDING.BANCONTACT;
    const standaloneButton = paypal.Buttons({
      fundingSource,
      ...paymentSessionOptions,
    });

    if (standaloneButton.isEligible()) {
      await standaloneButton.render(v5Button);
      showV5Button = () => v5Button.removeAttribute("hidden");
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
