async function onPayPalWebSdkLoaded() {
  try {
    const braintreeClientToken = await getBraintreeBrowserSafeClientToken();
    const paypalInstance = await window.paypal.createInstance({
      clientToken: braintreeClientToken,
      components: ["paypal-payments"],
      pageType: "checkout",
    });

    const braintreeInstance = await window.braintree.client.create({
      authorization: braintreeClientToken,
    });

    const braintreeCheckout = await window.braintree.paypalCheckout.create({
      client: braintreeInstance,
    });

    setupPayPalButton({ paypalInstance, braintreeCheckout });
  } catch (error) {
    console.error(error);
  }
}

async function setupPayPalButton({ paypalInstance, braintreeCheckout }) {
  const paypalPaymentSession = paypalInstance.createPayPalOneTimePaymentSession(
    {
      async onApprove(data) {
        console.log("onApprove", data);
        const { nonce } = await braintreeCheckout.tokenizePayment({
          payerID: data.payerId,
          paymentID: data.orderId,
        });
        const orderData = await completePayment(nonce);
        console.log("Capture result", orderData);
      },
      onCancel(data) {
        console.log("onCancel", data);
      },
      onError(error) {
        console.log("onError", error);
      },
    },
  );

  const paypalButton = document.querySelector("#paypal-button");
  paypalButton.removeAttribute("hidden");

  paypalButton.addEventListener("click", async () => {
    try {
      await paypalPaymentSession.start(
        {
          presentationMode: "auto",
        },
        createOrder(braintreeCheckout),
      );
    } catch (error) {
      console.error(error);
    }
  });
}

async function createOrder(braintreeCheckout) {
  const orderId = await braintreeCheckout.createPayment({
    flow: "checkout",
    amount: 10.0,
    currency: "USD",
    intent: "capture",
  });

  return { orderId };
}

async function getBraintreeBrowserSafeClientToken() {
  const response = await fetch(
    "/braintree-api/auth/browser-safe-client-token",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const { accessToken } = await response.json();

  return accessToken;
}

async function completePayment(paymentMethodNonce) {
  const response = await fetch("/braintree-api/checkout/transaction/sale", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentMethodNonce,
      amount: 10.0,
    }),
  });
  const result = await response.json();

  return result;
}
