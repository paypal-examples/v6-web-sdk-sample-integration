/**
 * Class to manage and synchronize page state with the DOM.
 */
class PageState {
  /**
   * Internal state object.
   * @type {{presentationMode: string|null, lastPostMessage: Object|null, merchantDomain: string|null}}
   */
  state = {
    presentationMode: null,
    lastPostMessage: null,
    merchantDomain: null,
  };

  /**
   * Initializes the merchant domain to the current window origin.
   */
  constructor() {
    this.merchantDomain = window.location.origin;
  }

  /**
   * Sets the current presentation mode and updates the DOM.
   * @param {string} value - The presentation mode value.
   */
  set presentationMode(value) {
    this.state.presentationMode = value;
    const element = document.getElementById("presentationMode");
    element.innerHTML = value;
  }

  /**
   * Gets the current presentation mode.
   * @returns {string|null}
   */
  get presentationMode() {
    return this.state.presentationMode;
  }

  /**
   * Sets the last postMessage event and updates the DOM.
   * @param {MessageEvent} event - The postMessage event.
   */
  set lastPostMessage(event) {
    const statusContainer = document.getElementById("postMessageStatus");
    statusContainer.innerHTML = JSON.stringify(event.data);
    this.state.lastPostMessage = event;
  }

  /**
   * Gets the last postMessage event.
   * @returns {MessageEvent|null}
   */
  get lastPostMessage() {
    return this.state.lastPostMessage;
  }

  /**
   * Sets the merchant domain and updates the DOM.
   * @param {string} value - The merchant domain.
   */
  set merchantDomain(value) {
    document.getElementById("merchantDomain").innerHTML = value;
    this.state.merchantDomain = value;
  }
}

const pageState = new PageState();

/**
 * Handles postMessage events for the "popup" presentation mode.
 * @param {MessageEvent} event - The postMessage event.
 */
function popupPresentationModePostMessageHandler(event) {
  const { eventName, data } = event.data;
  const overlay = document.getElementById("overlayContainer");

  if (eventName === "payment-flow-start") {
    overlay.showModal();
  } else if (eventName === "payment-flow-approved") {
    overlay.close();
  } else if (eventName === "payment-flow-canceled") {
    overlay.close();
  } else if (eventName === "payment-flow-error") {
    overlay.close();
  }
}

/**
 * Handles postMessage events for the "modal" presentation mode.
 * @param {MessageEvent} event - The postMessage event.
 */
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

/**
 * Sets up a window message event listener to handle postMessage events
 * from the child iframe, updating state and presentation as needed.
 */
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

/**
 * Sets up the overlay dialog and its close event listeners.
 */
function setupOverlay() {
  const overlay = document.getElementById("overlayContainer");

  const hideOverlay = () => {
    overlay.close();
    sendPostMessageToChild({ eventName: "close-payment-window" });
  };

  const closeCTA = document.getElementById("overlayCloseButtonCTA");
  closeCTA.addEventListener("click", hideOverlay);

  const closeBackdrop = document.getElementById("overlayCloseButtonBackdrop");
  closeBackdrop.addEventListener("click", hideOverlay);
}

/**
 * Initializes the overlay and postMessage listener on page load.
 */
function onLoad() {
  if (window.setupComplete) {
    return;
  }

  setupOverlay();
  setupPostMessageListener();

  window.setupComplete = true;
}

/**
 * Sends a postMessage to the child iframe with the given payload.
 * @param {Object} payload - The message payload to send.
 */
function sendPostMessageToChild(payload) {
  const iframe = document.getElementById("iframeWrapper");
  const childOrigin = new URL(iframe.getAttribute("src")).origin;
  iframe.contentWindow.postMessage(payload, childOrigin);
}
