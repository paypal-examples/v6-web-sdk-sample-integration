const getMerchantId = () => { 
  return document.getElementById('merchant-id-input').value
}

async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["bank-ach-payments"],
      pageType: "checkout",
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "USD",
      paymentFlow: "ONE_TIME_PAYMENT",
      paymentMethods: ["ACH"],
      merchantId: getMerchantId(),
    });

    if (paymentMethods.isEligible("ach")) {
      setupAchButton(sdkInstance);
    }
    console.log('sdk loaded')
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
    console.log("Capture order", orderData);
  },
  onCancel(data) {
    console.log("onCancel", data);
  },
  onError(error) {
    console.log("onError", error);
  },
};


async function setupAchButton(sdkInstance) {
  const achPaymentSession = sdkInstance.createBankAchOneTimePaymentSession(
    paymentSessionOptions,
  );
  document.getElementById('ach-button-container').innerHTML = '<bank-ach-button id="ach-button">';
  const onClick = async () =>  { 
    const startOptions = {
      presentationMode: "popup",
    }

    const orderPayload ={
      intent: 'CAPTURE',
      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: "100.00",
          },
          payee: { 
            merchantId: getMerchantId()
          } 
        },
      ]
    }; 
    const checkoutOptionsPromise = createOrder(orderPayload).then((orderId) => {
      console.log("Created order", orderId);

      return orderId  
    }
    )
    try { 
      await achPaymentSession.start(startOptions, checkoutOptionsPromise)
    } catch(e) { 
      console.error(e)
    }
  }
  const achButton = document.querySelector("#ach-button");

  achButton.removeAttribute("hidden");
  achButton.addEventListener("click", onClick);
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

async function createOrder(orderPayload) {
  const response = await fetch("/paypal-api/checkout/orders/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderPayload),
  });
  const { id } = await response.json();

  return {orderId: id};
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
