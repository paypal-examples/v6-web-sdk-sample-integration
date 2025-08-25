import { loadCustomScript } from "@paypal/paypal-js/sdk-v6";
import type { SdkInstance, OnApproveDataOneTimePayments, OneTimePaymentSession } from "@paypal/paypal-js/sdk-v6"

loadCustomScript({
  url: "https://www.sandbox.paypal.com/web-sdk/v6/core?debug=true"
}).then(() => {
  onPayPalWebSdkLoaded();
})

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

async function onApproveCallback(data: OnApproveDataOneTimePayments) {
  console.log("onApprove", data);
  const orderData = await captureOrder({
    orderId: data.orderId,
  });
  console.log("Capture result", orderData);
}

async function setupPayPalButton(sdkInstance: SdkInstance) {
  let paypalPaymentSession: OneTimePaymentSession;

  if (sdkInstance && sdkInstance.createPayPalOneTimePaymentSession) {
    paypalPaymentSession = sdkInstance?.createPayPalOneTimePaymentSession(
      { onApprove: onApproveCallback },
    );
  }

  const paypalButton = document.querySelector("#paypal-button");
  paypalButton?.removeAttribute("hidden");

  paypalButton?.addEventListener("click", async () => {
    try {
      await paypalPaymentSession.start(
        { presentationMode: "auto" },
        createOrder(),
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

async function captureOrder({ orderId }: { orderId: string }) {
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
