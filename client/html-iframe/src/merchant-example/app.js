window.pageState = {
  presentationMode: null,
};

function setupPage () {
  const origin = window.location.origin;
  document.querySelector('#merchantDomain').innerHTML = origin;
}

function setCurrentPresentationMode (presentationMode) {
  const element = document.getElementById('presentationMode');
  element.innerHTML = presentationMode;
  window.pageState.presentationMode = presentationMode;
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
    statusContainer.innerHTML = JSON.stringify(event.data);

    if (eventName === 'presentationMode-changed') {
      const { presentationMode } = data;
      setCurrentPresentationMode(presentationMode);
    } else if (eventName === "payment-flow-start") {
      const {paymentFlowConfig: { presentationMode } } = data;
      if (presentationMode === "popup") {
        showOverlay();
      }
    } else if (eventName === "payment-flow-approved") {
      hideOverlay();
    } else if (eventName === "payment-flow-canceled") {
      hideOverlay();
    } else if (eventName === "payment-flow-error") {
      hideOverlay();
    }
  });
}

function setupOverlay () {
  const overlay = document.getElementById('overlayContainer');

  const showOverlay = () => {
    overlay.showModal();
  };

  const hideOverlay = () => {
    overlay.close();
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
