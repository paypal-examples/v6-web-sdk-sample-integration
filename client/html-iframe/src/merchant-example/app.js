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

  if (eventName === "payment-flow-start") {
    overlay.showModal();
  } else if (eventName === "payment-flow-approved") {
    overlay.close();
    sendPostMessageToChild({ eventName: "close-payment-window" });
  } else if (eventName === "payment-flow-canceled") {
    overlay.close();
    sendPostMessageToChild({ eventName: "close-payment-window" });
  } else if (eventName === "payment-flow-error") {
    overlay.close();
    sendPostMessageToChild({ eventName: "close-payment-window" });
  }
}

function modalPresentationModePostMessageHandler(event) {
  const { eventName, data } = event.data;
  const iframe = document.getElementById("iframeWrapper");

  if (eventName === "payment-flow-start") {
    iframe.classList.add("fullWindow");
  } else if (eventName === "payment-flow-approved") {
    iframe.classList.remove("fullWindow");
  } else if (eventName === "payment-flow-canceled") {
    iframe.classList.remove("fullWindow");
  } else if (eventName === "payment-flow-error") {
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

    const { presentationMode } = pageState;

    if (eventName === "presentationMode-changed") {
      const { presentationMode } = data;
      pageState.presentationMode = presentationMode;
    } else if (presentationMode === "popup") {
      popupPresentationModePostMessageHandler(event);
    } else if (presentationMode === "modal") {
      modalPresentationModePostMessageHandler(event);
    }
  });
}

function setupOverlay() {
  const overlay = document.getElementById("overlayContainer");

  const hideOverlay = () => {
    overlay.close();
    sendPostMessageToChild({ eventName: "close-payment-window" });
  };

  const refocusPaymentWindow = () => {
    sendPostMessageToChild({ eventName: "refocus-payment-window" });
  };

  const close = document.getElementById("overlayCloseButton");
  close.addEventListener("click", hideOverlay);

  const refocus = document.getElementById("overlayRefocusButton");
  refocus.addEventListener("click", refocusPaymentWindow);
}

function onLoad() {
  if (window.setupComplete) {
    return;
  }

  setupOverlay();
  setupPostMessageListener();

  window.setupComplete = true;
}

function sendPostMessageToChild(payload) {
  const iframe = document.getElementById("iframeWrapper");
  const childOrigin = new URL(iframe.getAttribute("src")).origin;
  iframe.contentWindow.postMessage(payload, childOrigin);
}
