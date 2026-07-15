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

// The merchant (parent) page passes its own URL so this iframe's SDK
// instance can check and resume the redirect flow, if needed. PayPal
// appends the redirect flow's query params to the merchant page's URL,
// not to this iframe's URL, since the merchant page is what actually
// left and came back.
function getReturnToUrl() {
  return new URLSearchParams(window.location.search).get("returnTo");
}

function setupPostMessageListener() {
  window.addEventListener("message", (event) => {
    // It's very important to check that the `origin` is expected to prevent XSS attacks!
    if (event.origin !== getParentOrigin()) {
      return;
    }

    const statusContainer = document.querySelector("#postMessageStatus");
    statusContainer.innerHTML = JSON.stringify(event.data);
  });
}

function sendPostMessageToParent(payload) {
  window.parent.postMessage(payload, getParentOrigin());
}

function setupIframeOriginDisplay() {
  document.querySelector("#iframeDomain").innerHTML = window.location.origin;
}

const paymentSessionOptions = {
  async onApprove(data) {
    const orderData = await captureOrder({
      orderId: data.orderId,
    });

    sendPostMessageToParent({
      eventName: "payment-flow-approved",
      data: orderData,
    });
  },
  onCancel(data) {
    sendPostMessageToParent({
      eventName: "payment-flow-canceled",
      data: { orderId: data?.orderId },
    });
  },
  onError(data) {
    sendPostMessageToParent({
      eventName: "payment-flow-error",
      data: { orderId: data?.orderId },
    });
  },
};

function configurePayPalButton(paymentSession) {
  const paypalButton = document.querySelector("#paypal-button");
  paypalButton.removeAttribute("hidden");

  paypalButton.addEventListener("click", async () => {
    sendPostMessageToParent({ eventName: "payment-flow-start" });

    try {
      // get the promise reference by invoking createRedirectOrder()
      // do not await this async function since it can cause transient activation issues
      const createRedirectOrderPromise = createRedirectOrder();

      const { redirectURL } = await paymentSession.start(
        {
          presentationMode: "redirect",
          // `autoRedirect` must be disabled, since, by default, the SDK performs the
          // redirect itself via `window.top.location.assign()`, which a cross-origin
          // sandboxed iframe cannot do without the `allow-top-navigation` sandbox
          // permission.
          autoRedirect: { enabled: false },
        },
        createRedirectOrderPromise,
      );

      if (redirectURL) {
        sendPostMessageToParent({
          eventName: "redirect-requested",
          data: { redirectURL },
        });
      }
    } catch (error) {
      console.error(error);
      sendPostMessageToParent({
        eventName: "payment-flow-error",
        data: { message: String(error) },
      });
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

    pageState.paymentSession = sdkInstance.createPayPalOneTimePaymentSession(
      paymentSessionOptions,
    );

    const returnToUrl = getReturnToUrl();
    if (pageState.paymentSession.hasReturned(returnToUrl)) {
      sendPostMessageToParent({ eventName: "payment-flow-resuming" });
      await pageState.paymentSession.resume(returnToUrl);
    } else {
      configurePayPalButton(pageState.paymentSession);
    }
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
  if (!response.ok) {
    throw new Error("Failed to fetch client id");
  }
  const { clientId } = await response.json();

  return clientId;
}

async function createRedirectOrder() {
  const merchantReturnUrl = getReturnToUrl();

  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-paypal-one-time-payment-with-redirect-rest",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        returnUrl: merchantReturnUrl,
        cancelUrl: merchantReturnUrl,
      }),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to create order");
  }
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
  if (!response.ok) {
    throw new Error("Failed to capture order");
  }
  const data = await response.json();

  return data;
}
