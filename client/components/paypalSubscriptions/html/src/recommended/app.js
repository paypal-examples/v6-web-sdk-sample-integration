/**
 * Initializes the PayPal Web SDK, determines eligible payment methods,
 * and sets up the appropriate subscription buttons. This function is invoked
 * by the SDK script tag's "onload" event.
 *
 * ```html
 * <script
 *   async
 *   src="https://www.sandbox.paypal.com/web-sdk/v6/core"
 *   onload="onPayPalWebSdkLoaded()">
 * </script>
 * ```
 *
 * @async
 * @function onPayPalWebSdkLoaded
 * @returns {Promise<void>}
 */
async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
      components: ["paypal-subscriptions"],
      pageType: "checkout",
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
      paymentFlow: "RECURRING_PAYMENT",
      currencyCode: "USD",
    });

    if (paymentMethods.isEligible("paypal")) {
      configurePayPalButton(sdkInstance);
    }
  } catch (error) {
    renderAlert({
      type: "danger",
      message: "Failed to initialize the PayPal Web SDK",
    });
    console.error(error);
  }
}

async function configurePayPalButton(sdkInstance) {
  const paypalPaymentSession =
    sdkInstance.createPayPalSubscriptionPaymentSession({
      async onApprove(data) {
        console.log("onApprove", data);
        renderAlert({
          type: "success",
          message: `Subscription successfully approved! ${JSON.stringify(data)}`,
        });
      },
      onCancel(data) {
        renderAlert({
          type: "warning",
          message: `onCancel() callback called ${data.subscriptionId ?? ""}`,
        });
        console.log("onCancel", data);
      },
      onError(error) {
        renderAlert({
          type: "danger",
          message: `onError() callback called: ${error.message}`,
        });
        console.log("onError", error);
      },
    });

  const paypalButton = document.querySelector("#paypal-button");
  paypalButton.removeAttribute("hidden");

  paypalButton.addEventListener("click", async () => {
    try {
      // get the promise reference by invoking createSubscription()
      // do not await this async function since it can cause transient activation issues
      const createSubscriptionPromise = createSubscription();
      await paypalPaymentSession.start(
        { presentationMode: "auto" },
        createSubscriptionPromise,
      );
    } catch (error) {
      renderAlert({
        type: "danger",
        message: `PayPal Button click failure: ${error.message}`,
      });
      console.error(error);
    }
  });
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

async function createSubscription() {
  const response = await fetch("/paypal-api/billing/create-subscription", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Subscription creation failed ${data ? JSON.stringify(data) : ""}`,
    );
  }

  renderAlert({
    type: "info",
    message: `Subscription successfully created: ${data.id}`,
  });

  return { subscriptionId: data.id };
}

function renderAlert({ type, message }) {
  const alertComponentElement = document.querySelector("alert-component");
  if (!alertComponentElement) {
    return;
  }

  alertComponentElement.setAttribute("type", type);
  alertComponentElement.innerText = message;
}
