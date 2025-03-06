class PageState {
  state = {
    presentationMode: null,
  };

  set presentationMode (value) {
    this.state.presentationMode = value;
  }

  get presentationMode () {
    return this.state.presentationMode;
  }
}

const pageState = new PageState();

function setupPage () {
  const origin = window.location.origin;
  document.querySelector('#merchantDomain').innerHTML = origin;
}

function setCurrentPresentationMode (presentationMode) {
  const element = document.getElementById('presentationMode');
  element.innerHTML = presentationMode;
  pageState.presentationMode = presentationMode;
}

function popupPresentationModePostMessageHandler (event, overlayControls) {
  const {eventName, data} = event.data;
  const {showOverlay, hideOverlay} = overlayControls;
  if (eventName === "payment-flow-start") {
    showOverlay();
  } else if (eventName === "payment-flow-approved") {
    hideOverlay();
  } else if (eventName === "payment-flow-canceled") {
    hideOverlay();
  } else if (eventName === "payment-flow-error") {
    hideOverlay();
  }
}

function modalPresentationModePostMessageHandler (event) {
  const {eventName, data} = event.data;
  if (eventName === "payment-flow-start") {
    // TODO
  } else if (eventName === "payment-flow-approved") {
    // TODO
  } else if (eventName === "payment-flow-canceled") {
    // TODO
  } else if (eventName === "payment-flow-error") {
    // TODO
  }
}

function setupPostMessageListener (overlayControls) {

  window.addEventListener("message", (event) => {
    // It's very important to check that the `origin` is expected to prevent XSS attacks!
    if (event.origin !== "http://localhost:3000") {
      return;
    }

    const {eventName, data} = event.data;

    const statusContainer = document.querySelector("#postMessageStatus");
    statusContainer.innerHTML = JSON.stringify(event.data);

    const { presentationMode } = pageState;

    if (eventName === 'presentationMode-changed') {
      const { presentationMode } = data;
      setCurrentPresentationMode(presentationMode);
    } else if (presentationMode === 'popup') {
// TODO move overlayControls down into the handler somehow
      popupPresentationModePostMessageHandler(event, overlayControls);
    } else if (presentationMode === 'modal') {
      modalPresentationModePostMessageHandler(event);
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
