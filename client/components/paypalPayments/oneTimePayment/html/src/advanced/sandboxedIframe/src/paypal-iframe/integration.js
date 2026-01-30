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

function getSelectedPresentationMode() {
  return document.querySelector("input[name='presentationMode']:checked").value;
}

function setupPresentationModeRadio() {
  const selector = document.querySelectorAll("input[name='presentationMode']");
  Array.from(selector).forEach((element) => {
    element.addEventListener("change", (event) => {
      const { target } = event;
      if (target.checked) {
        sendPostMessageToParent({
          eventName: "presentationMode-changed",
          data: { presentationMode: target.value },
        });
      }
    });

    if (element.checked) {
      sendPostMessageToParent({
        eventName: "presentationMode-changed",
        data: { presentationMode: element.value },
      });
    }
  });
}

function setupIframeOriginDisplay() {
  const origin = window.location.origin;
  document.querySelector("#iframeDomain").innerHTML = origin;
}

async function setupPayPalButton(sdkInstance) {
  pageState.paymentSession = sdkInstance.createPayPalOneTimePaymentSession({
    onApprove: async (data) => {
      const orderData = await captureOrder({
        orderId: data.orderId,
      });

      sendPostMessageToParent({
        eventName: "payment-flow-approved",
        data: orderData,
      });
    },
    onCancel: (data) => {
      sendPostMessageToParent({
        eventName: "payment-flow-canceled",
        data: {
          orderId: data?.orderId,
        },
      });
    },
    onError: (data) => {
      sendPostMessageToParent({
        eventName: "payment-flow-canceled",
        data: {
          orderId: data?.orderId,
        },
      });
    },
  });

  const paypalButton = document.querySelector("#paypal-button");
  paypalButton.addEventListener("click", async () => {
    const paymentFlowConfig = {
      presentationMode: getSelectedPresentationMode(),
      fullPageOverlay: { enabled: false },
    };

    sendPostMessageToParent({
      eventName: "payment-flow-start",
      data: { paymentFlowConfig },
    });

    try {
      // get the promise reference by invoking createOrder()
      // do not await this async function since it can cause transient activation issues
      const createOrderPromise = createOrder();
      await pageState.paymentSession.start(
        paymentFlowConfig,
        createOrderPromise,
      );
    } catch (e) {
      console.error(e);
    }
  });
}

async function onPayPalWebSdkLoaded() {
  if (window.setupComplete) {
    return;
  }

  setupPresentationModeRadio();
  setupIframeOriginDisplay();
  setupPostMessageListener();

  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      components: ["paypal-payments"],
      pageType: "checkout",
    });

    setupPayPalButton(sdkInstance);
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
