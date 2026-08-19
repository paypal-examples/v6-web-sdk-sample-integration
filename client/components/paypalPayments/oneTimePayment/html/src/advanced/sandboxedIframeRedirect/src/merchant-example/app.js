class PageState {
  state = {
    lastPostMessage: null,
    merchantDomain: null,
  };

  constructor() {
    this.merchantDomain = window.location.origin;
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

const PARTNER_IFRAME_ORIGIN = "http://localhost:3000";

function buildIframeSrc() {
  // `returnTo` lets the iframe's SDK instance check/resume the redirect flow
  // against this page's URL once PayPal redirects back here. It's passed on
  // every load, not just after a real return; the SDK's hasReturned() decides
  // whether it's actually a resume.
  const params = new URLSearchParams({
    origin: window.location.origin,
    returnTo: window.location.href,
  });

  return `${PARTNER_IFRAME_ORIGIN}/?${params.toString()}`;
}

function configurePostMessageListener() {
  window.addEventListener("message", (event) => {
    // It's very important to check that the `origin` is expected to prevent XSS attacks!
    if (event.origin !== PARTNER_IFRAME_ORIGIN) {
      return;
    }

    pageState.lastPostMessage = event;
    const { eventName, data } = event.data;

    if (eventName === "redirect-requested") {
      // The iframe cannot navigate the top-level page itself (it's sandboxed
      // and cross-origin), so this merchant page performs the redirect on its
      // behalf.
      window.location.assign(data.redirectURL);
    }
  });
}

function onLoad() {
  if (window.setupComplete) {
    return;
  }

  document.getElementById("iframeWrapper").src = buildIframeSrc();
  configurePostMessageListener();

  window.setupComplete = true;
}
