class PageState {
  state = {
    presentationMode: null,
    lastPostMessage: null,
    merchantDomain: null,
  };

  constructor() {
    this.merchantDomain = window.location.origin;
  }

  set presentationMode(value) {
    this.state.presentationMode = value;
    const element = document.getElementById("presentationMode");
    element.innerHTML = value;
  }

  get presentationMode() {
    return this.state.presentationMode;
  }

  set lastPostMessage(event) {
    const statusContainer = document.getElementById("postMessageStatus");
    statusContainer.innerHTML = JSON.stringify(event.data);
    this.state.lastPostMessage = event;
  }

  get lastPostMessage() {
    return this.state.lastPostMessage;
  }

  set merchantDomain(value) {
    document.getElementById("merchantDomain").innerHTML = value;
    this.state.merchantDomain = value;
  }
}

const pageState = new PageState();

function popupPresentationModePostMessageHandler(event) {
  const { eventName, data } = event.data;
  const overlay = document.getElementById("overlayContainer");

  if (eventName === "payment-flow-popup-start") {
    overlay.showModal();
  } else if (eventName === "payment-flow-popup-approved") {
    overlay.close();
  } else if (eventName === "payment-flow-popup-canceled") {
    overlay.close();
  } else if (eventName === "payment-flow-popup-errored") {
    overlay.close();
  } else if (eventName === "payment-flow-popup-failed-to-open") {
    overlay.close();
    pageState.presentationMode = "modal";
    sendPostMessageToChildModalContainerIframe({
      eventName: "payment-flow-modal-start",
      data,
    });
    const iframe = document.getElementById("iframeModalContainer");
    iframe.classList.add("fullWindow");
  }
}

function modalPresentationModePostMessageHandler(event) {
  const { eventName, data } = event.data;
  const iframe = document.getElementById("iframeModalContainer");

  if (eventName === "payment-flow-modal-approved") {
    iframe.classList.remove("fullWindow");
  } else if (eventName === "payment-flow-modal-canceled") {
    iframe.classList.remove("fullWindow");
  } else if (eventName === "payment-flow-modal-errored") {
    iframe.classList.remove("fullWindow");
  }
}

function setupPostMessageListener() {
  window.addEventListener("message", (event) => {
    // It's very important to check that the `origin` is expected to prevent XSS attacks!
    if (event.origin !== "http://localhost:3000") {
      return;
    }

    pageState.lastPostMessage = event;
    const { eventName, data } = event.data;

    if (eventName.startsWith("payment-flow-popup")) {
      pageState.presentationMode = "popup";
      popupPresentationModePostMessageHandler(event);
    } else if (eventName.startsWith("payment-flow-modal")) {
      pageState.presentationMode = "modal";
      modalPresentationModePostMessageHandler(event);
    }
  });
}

function setupOverlay() {
  const overlay = document.getElementById("overlayContainer");

  const hideOverlay = () => {
    overlay.close();
    sendPostMessageToChildButtonIframe({ eventName: "close-payment-window" });
  };

  const closeCTA = document.getElementById("overlayCloseButtonCTA");
  closeCTA.addEventListener("click", hideOverlay);

  const closeBackdrop = document.getElementById("overlayCloseButtonBackdrop");
  closeBackdrop.addEventListener("click", hideOverlay);
}

function onLoad() {
  if (window.setupComplete) {
    return;
  }

  setupOverlay();
  setupPostMessageListener();

  window.setupComplete = true;
}

function sendPostMessageToChildButtonIframe(payload) {
  const iframe = document.getElementById("iframeButton");
  const childOrigin = new URL(iframe.getAttribute("src")).origin;
  iframe.contentWindow.postMessage(payload, childOrigin);
}

function sendPostMessageToChildModalContainerIframe(payload) {
  const iframe = document.getElementById("iframeModalContainer");
  const childOrigin = new URL(iframe.getAttribute("src")).origin;
  iframe.contentWindow.postMessage(payload, childOrigin);
}
