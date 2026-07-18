class PageState {
  state = {
    paymentSession: null,
  };

  get paymentSession() {
    return this.state.paymentSession;
  }

  set paymentSession(value) {
    this.state.paymentSession = value;
  }
}

const pageState = new PageState();

function getParentOrigin() {
  const parentOrigin = new URLSearchParams(window.location.search).get(
    "origin",
  );
  return parentOrigin;
}

function setupPostMessageListener() {
  window.addEventListener("message", (event) => {
    // It's very important to check that the `origin` is expected to prevent XSS attacks!
    if (event.origin !== getParentOrigin()) {
      return;
    }

    const { eventName } = event.data;

    const statusContainer = document.querySelector("#postMessageStatus");
    statusContainer.innerHTML = JSON.stringify(event.data);

    if (eventName === "close-payment-window") {
      pageState.paymentSession?.cancel();
    }
  });
}

function sendPostMessageToParent(payload) {
  window.parent.postMessage(payload, getParentOrigin());
}

function setupIframeOriginDisplay() {
  const origin = window.location.origin;
  document.querySelector("#iframeDomain").innerHTML = origin;
}

async function configurePayPalButton(sdkInstance) {
  pageState.paymentSession = sdkInstance.createPayPalOneTimePaymentSession({
    onApprove: async (data) => {
      const orderData = await captureOrder({
        orderId: data.orderId,
      });

      sendPostMessageToParent({
        eventName: "payment-flow-popup-approved",
        data: orderData,
      });
    },
    onCancel: (data) => {
      sendPostMessageToParent({
        eventName: "payment-flow-popup-canceled",
        data: {
          orderId: data?.orderId,
        },
      });
    },
    onError: (data) => {
      sendPostMessageToParent({
        eventName: "payment-flow-popup-errored",
        data: {
          orderId: data?.orderId,
        },
      });
    },
  });

  const paypalButton = document.querySelector("#paypal-button");
  paypalButton.addEventListener("click", async () => {
    const paymentFlowConfig = {
      presentationMode: "popup",
      fullPageOverlay: { enabled: false },
    };

    sendPostMessageToParent({
      eventName: "payment-flow-popup-start",
      data: { paymentFlowConfig },
    });

    let orderIdValue;

    try {
      // get the promise reference by invoking createOrder()
      // do not await this async function since it can cause transient activation issues
      const createOrderPromise = createOrder().then(({ orderId }) => {
        orderIdValue = orderId;
        return { orderId };
      });

      await pageState.paymentSession.start(
        paymentFlowConfig,
        createOrderPromise,
      );
    } catch (error) {
      if (error.isRecoverable) {
        sendPostMessageToParent({
          eventName: "payment-flow-popup-failed-to-open",
          data: {
            isOrderIdKnown: Boolean(orderIdValue),
            orderId: orderIdValue,
          },
        });
      }

      console.error(error);
    }
  });
}

async function onPayPalWebSdkLoaded() {
  if (window.setupComplete) {
    return;
  }

  setupIframeOriginDisplay();
  setupPostMessageListener();

  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      components: ["paypal-payments"],
      pageType: "checkout",
    });

    configurePayPalButton(sdkInstance);
  } catch (error) {
    console.error(error);
  }

  window.setupComplete = true;
}

async function getBrowserSafeClientId() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-id", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { clientId } = await response.json();

  return clientId;
}

async function createOrder() {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-one-time-payment",
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
