function setupPage () {
  const origin = window.location.origin;
  document.querySelector('#merchantDomain').innerHTML = origin;
}

function setupPostMessageListener (overlayControls) {
  const {showOverlay, hideOverlay} = overlayControls;

  window.addEventListener("message", (event) => {
    // It's very important to check that the `origin` is expected to prevent XSS attacks!
    if (event.origin !== "http://localhost:3000") {
      return;
    }

    const {eventName, data} = event.data;

    const statusContainer = document.querySelector("#postMessageStatus");

    if (eventName === "payment-flow-start") {
      showOverlay();
    } else if (eventName === "payment-flow-approved") {
      statusContainer.innerHTML = `🥳 approved, order id ${JSON.stringify(data)}`;
      hideOverlay();
    } else if (eventName === "payment-flow-canceled") {
      statusContainer.innerHTML = `🙅 canceled, order id ${data.orderId}`;
      hideOverlay();
    } else if (eventName === "payment-flow-error") {
      statusContainer.innerHTML = `😱 error, order id ${data.error.message}`;
      hideOverlay();
    }
  });
}

function setupOverlay () {
  const overlay = document.getElementById('overlayContainer');

  const showOverlay = () => {
    overlay.classList.remove('hidden');
  };

  const hideOverlay = () => {
    overlay.classList.add('hidden');
    sendPostMessageToChild({eventName: 'close-payment-window'});
  };

  const refocusPaymentWindow = () => {
    sendPostMessageToChild({eventName: 'refocus-payment-window'});
  };

  const close = document.getElementById('overlayCloseButton');
  close.addEventListener('click', hideOverlay);

  const refocus = document.getElementById('overlayRefocusButton');
  refocus.addEventListener('click', refocusPaymentWindow);

  return {
    showOverlay,
    hideOverlay,
  };
}

function onLoad() {
  if (window.setupComplete) {
    return;
  }

  setupPage();

  const overlayControls = setupOverlay();

  setupPostMessageListener(overlayControls);

  window.setupComplete = true;
}

function sendPostMessageToChild (payload) {
  const iframe = document.getElementById("iframeWrapper");
  const childOrigin = new URL(iframe.getAttribute('src')).origin;
  iframe.contentWindow.postMessage(payload, childOrigin);
}
