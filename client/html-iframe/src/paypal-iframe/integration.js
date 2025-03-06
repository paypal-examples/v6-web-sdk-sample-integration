const getSandboxUrl = (path) => `http://localhost:8080${path}`;

async function getBrowserSafeClientToken() {
  const response = await fetch(
    getSandboxUrl("/paypal-api/auth/browser-safe-client-token"),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const { access_token } = await response.json();

  return access_token;
}

async function createOrder() {
  const response = await fetch(
    getSandboxUrl("/paypal-api/checkout/orders/create"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const orderData = await response.json();

  return { orderId: orderData.id };
}

async function captureOrder({ orderId, headers }) {
  const response = await fetch(
    getSandboxUrl(`/paypal-api/checkout/orders/${orderId}/capture`),
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

async function onApprove(data) {
  const orderData = await captureOrder({
    orderId: data.orderId,
  });

  sendPostMessageToParent({
    eventName: "payment-flow-approved",
    data: orderData,
  });
}

function onCancel(data) {
  sendPostMessageToParent({
    eventName: "payment-flow-canceled",
    data: {
      orderId: data?.orderId,
    },
  });
}

function onError(data) {
  sendPostMessageToParent({
    eventName: "payment-flow-error",
    data: {
      error: data?.error,
    },
  });
}

function getParentOrigin () {
  const parentOrigin = new URLSearchParams(window.location.search).get("origin");
  return parentOrigin;
}

function setupPostMessageListener() {
  window.addEventListener("message", (event) => {
    // It's very important to check that the `origin` is expected to prevent XSS attacks!
    if (event.origin !== getParentOrigin()) {
      return;
    }

    const { eventName, data } = event.data;

    const statusContainer = document.querySelector("#postMessageStatus");
    statusContainer.innerHTML = JSON.stringify(event.data);

    if (eventName === "refocus-payment-window") {
      // TODO
    } else if (eventName === "close-payment-window") {
      // TODO
    }
  });
}

function sendPostMessageToParent(payload) {
  window.parent.postMessage(payload, getParentOrigin());
}

function getSelectedPresentationMode () {
  return document.querySelector("input[name='presentationMode']:checked").value;
}

function setupPresentationModeRadio () {
  const selector = document.querySelectorAll("input[name='presentationMode']");
  Array.from(selector).forEach((element) => {
    element.addEventListener("change", (event) => {
      const { target } = event;
      if (target.checked) {
        sendPostMessageToParent({ eventName: 'presentationMode-changed', data: { presentationMode: target.value } });
      }
    });

    if (element.checked) {
        sendPostMessageToParent({ eventName: 'presentationMode-changed', data: { presentationMode: element.value } });
    }
  });
}

function setupIframeOriginDisplay () {
  const origin = window.location.origin;
  document.querySelector('#iframeDomain').innerHTML = origin;
}

async function onLoad() {
  if (window.setupComplete) {
    return;
  }

  try {
    setupPresentationModeRadio();
    setupIframeOriginDisplay();
    setupPostMessageListener();

    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-payments"],
    });
    const paypalOneTimePaymentSession =
      sdkInstance.createPayPalOneTimePaymentSession({
        onApprove,
        onCancel,
        onError,
      });

    async function onClick() {
      const paymentFlowConfig = {
        presentationMode: getSelectedPresentationMode(),
        fullPageOverlay: { enabled: false },
      };

      sendPostMessageToParent({
        eventName: "payment-flow-start",
        data: {paymentFlowConfig},
      });

      try {
        await paypalOneTimePaymentSession.start(paymentFlowConfig, createOrder());
      } catch (e) {
        console.error(e);
      }
    }
    const paypalButton = document.querySelector("#paypal-button");
    paypalButton.addEventListener("click", onClick);
  } catch (e) {
    console.error(e);
  }

  window.setupComplete = true;
}
