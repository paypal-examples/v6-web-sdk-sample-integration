async function onPayPalLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-payments"],
      pageType: "checkout",
    });

    setupPayPalButton(sdkInstance);
  } catch (error) {
    console.error(error);
  }
}

async function setupPayPalButton(sdkInstance) {
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

  const paypalPaymentSession = sdkInstance.createPayPalOneTimePaymentSession(
    paymentSessionOptions,
  );

  const paypalButton = document.querySelector("#paypal-button");
  paypalButton.removeAttribute("hidden");

  paypalButton.addEventListener("click", async () => {
    startTheClock();
    const createOrderPromiseReference = createOrder();

    const presentationModesToTry = [
      {
        presentationMode: "payment-handler",
        recoverableErrorCode: "ERR_FLOW_PAYMENT_HANDLER_BROWSER_INCOMPATIBLE",
      },
      {
        presentationMode: "popup",
        recoverableErrorCode: "ERR_DEV_UNABLE_TO_OPEN_POPUP",
      },
      {
        presentationMode: "modal",
      },
    ];

    for (const {
      presentationMode,
      recoverableErrorCode,
    } of presentationModesToTry) {
      try {
        await delayStart();
        await paypalPaymentSession.start(
          { presentationMode },
          createOrderPromiseReference,
        );
        // exit early when start() successfully resolves
        break;
      } catch (error) {
        // try another presentationMode for a recoverable error
        if (error.code === recoverableErrorCode) {
          continue;
        }
        throw error;
      }
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

async function delayStart() {
  const delayValue = Number(document.querySelector("#delay").value);
  return new Promise(function (resolve) {
    setTimeout(() => {
      resolve();
    }, delayValue * 1000);
  }).then(() => {
    delayComplete = true;
  });
}

function updateTimerLabels() {
  requestAnimationFrameId = requestAnimationFrame(updateTimerLabels);
  if (isTimerRunning === false) {
    return;
  }

  const timerLabel = document.querySelector("#transient-activation-timer");
  const timerState = document.querySelector("#transient-activation-state");

  timerState.innerHTML = `navigator.userActivation.isActive: ${navigator.userActivation.isActive}`;
  if (delayComplete === false) {
    timerLabel.innerHTML = `click timer in milliseconds: ${Date.now() - startTime}`;
  }
}

let isTimerRunning = false;
let startTime = 0;
let requestAnimationFrameId;
let delayComplete = false;

function startTheClock() {
  isTimerRunning = true;
  startTime = Date.now();
  requestAnimationFrameId = requestAnimationFrame(updateTimerLabels);
}

function resetTimer() {
  cancelAnimationFrame(requestAnimationFrameId);
  isTimerRunning = false;
  delayComplete = false;

  const timerLabel = document.querySelector("#transient-activation-timer");
  const timerState = document.querySelector("#transient-activation-state");

  timerLabel.innerHTML = "click timer in milliseconds: 0";
  timerState.innerHTML = "navigator.userActivation.isActive: false";
}

document.querySelector("#reset").addEventListener("click", resetTimer);
