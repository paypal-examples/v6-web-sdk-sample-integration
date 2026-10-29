/*
 * <paypal-webhook-assistant endpoint="..."> polls the endpoint every 2 seconds:
 *   GET    {endpoint}              -> { entries: Event[], names }
 *   DELETE {endpoint}?through=<id> -> removes that event and every older one
 *   Event = { id, type, receivedAt, payload }, newest first
 *
 * The browser keeps nothing between page loads: each page starts with a count
 * of zero and shows only events that arrive while it's open.
 */

import {
  EventDetails,
  EventList,
  WebhookFAB,
  WebhookInbox,
  WebhookToast,
  copyText,
  friendlyName,
} from "./webhook-assistant-views.js";

const POLL_INTERVAL_MS = 2000;
const TOAST_DURATION_MS = 5000;

// after "Clear all" the server can record the same event ID again, with a new
// receipt time, and that counts as a new event
function isSameEvent(entry, other) {
  return entry.id === other?.id && entry.receivedAt === other?.receivedAt;
}

// the events above the last one seen, or all of them if it's gone (cleared,
// dropped from the list, or the server restarted) or nothing was seen yet
function countNew(entries, seen) {
  const index = entries.findIndex((entry) => isSameEvent(entry, seen));
  return index === -1 ? entries.length : index;
}

class WebhookAssistant extends HTMLElement {
  #entries = [];
  #names = {};
  #count = 0;
  #open = false;
  #selectedId = null;
  // the newest event when the inbox was last opened, or when the page loaded;
  // the count is the events above it
  #seen;
  // the newest event at the last poll; only events newer than it get a toast
  #newest;
  #firstPoll = true;
  // set while Clear all's request is pending, so no poll brings the events back
  #clearing = false;
  #pollTimer;
  #toastEntryId = null;
  #toastTimer;
  #renderedSignature = "";

  connectedCallback() {
    if (!this.shadowRoot) {
      const styles = new URL("webhook-assistant.css", import.meta.url).href;
      // hidden until the styles load, so the page never shows them unstyled
      this.attachShadow({ mode: "open" }).innerHTML = `
        <link rel="stylesheet" href="${styles}">
        <div class="root" hidden>
          <div class="stack">${WebhookToast()}${WebhookInbox()}</div>
          ${WebhookFAB()}
        </div>`;
      this.#find("link").addEventListener("load", () => {
        this.#find(".root").hidden = false;
      });
      this.shadowRoot.addEventListener("click", this.#onClick);
    }
    this.#pollTimer = setInterval(() => void this.#poll(), POLL_INTERVAL_MS);
    this.#render();
    void this.#poll();
  }

  disconnectedCallback() {
    clearInterval(this.#pollTimer);
    this.#hideToast();
  }

  #find(selector) {
    return this.shadowRoot.querySelector(selector);
  }

  #actions = {
    toggle: () => (this.#open ? this.#closeInbox() : this.#openInbox()),
    close: () => this.#closeInbox(),
    clear: () => void this.#clearAll(),
    select: (target) => this.#selectEvent(target.dataset.id),
    back: () => this.#selectEvent(null),
    copy: (target) => void this.#copyPayload(target),
    "open-toast": () => {
      const id = this.#toastEntryId;
      this.#hideToast();
      this.#openInbox(id);
    },
    "close-toast": () => this.#hideToast(),
  };

  #onClick = (event) => {
    const target = event.target.closest("[data-action]");
    if (target) {
      this.#actions[target.dataset.action](target);
    }
  };

  #openInbox(selectedId = null) {
    this.#open = true;
    this.#selectedId = selectedId;
    this.#count = 0;
    this.#markSeen();
    this.#render();
  }

  #closeInbox() {
    this.#open = false;
    this.#selectedId = null;
    this.#render();
  }

  #selectEvent(id) {
    this.#selectedId = id;
    this.#render();
  }

  async #copyPayload(button) {
    const entry = this.#entries.find(({ id }) => id === this.#selectedId);
    const copied = await copyText(JSON.stringify(entry.payload, null, 2));
    button.textContent = copied ? "Copied" : "Copy failed";
    setTimeout(() => {
      button.textContent = "Copy payload";
    }, 1500);
  }

  async #clearAll() {
    const newest = this.#entries[0];
    if (!newest) {
      return;
    }
    this.#markSeen();
    this.#clearing = true;
    this.#entries = [];
    this.#selectedId = null;
    this.#count = 0;
    this.#hideToast();
    this.#render();
    // clears up to the newest event shown, so any that arrived since stay. If
    // the request fails, the next poll shows the events again
    const endpoint = this.getAttribute("endpoint");
    try {
      await fetch(`${endpoint}?through=${encodeURIComponent(newest.id)}`, {
        method: "DELETE",
      });
    } catch {}
    this.#clearing = false;
    void this.#poll();
  }

  async #poll() {
    if (this.#clearing) {
      return;
    }
    try {
      const response = await fetch(this.getAttribute("endpoint"), {
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }
      const { entries, names } = await response.json();
      // a poll that was running when Clear all started is out of date
      if (!this.#clearing) {
        this.#names = names;
        this.#applyEntries(entries);
      }
    } catch {
      // stay quiet while the server restarts
    }
  }

  #applyEntries(entries) {
    this.#entries = entries;
    // the first poll only notes the newest event, so events from before the
    // page loaded neither count nor toast
    if (this.#open || this.#firstPoll) {
      this.#markSeen();
    } else {
      this.#count = countNew(entries, this.#seen);
    }

    const newest = entries[0];
    if (newest && !this.#firstPoll && !isSameEvent(newest, this.#newest)) {
      this.#showToast(newest);
    }
    this.#newest = newest;
    this.#firstPoll = false;

    if (!entries.some((entry) => entry.id === this.#selectedId)) {
      this.#selectedId = null;
    }
    this.#render();
  }

  #markSeen() {
    this.#seen = this.#entries[0];
  }

  #showToast(entry) {
    this.#toastEntryId = entry.id;
    this.#find(".toast .name").textContent = friendlyName(
      entry.type,
      this.#names,
    );
    this.#find(".toast .type").textContent = entry.type;
    this.#find(".toast").hidden = false;
    // restart the countdown bar from full width; the toast must be visible
    // first, or the browser skips the animation
    const bar = this.#find(".toast .bar");
    bar.style.transition = "none";
    bar.style.width = "100%";
    void bar.offsetWidth;
    bar.style.transition = `width ${TOAST_DURATION_MS}ms linear`;
    bar.style.width = "0";
    clearTimeout(this.#toastTimer);
    this.#toastTimer = setTimeout(() => this.#hideToast(), TOAST_DURATION_MS);
  }

  #hideToast() {
    clearTimeout(this.#toastTimer);
    this.#toastEntryId = null;
    this.#find(".toast").hidden = true;
  }

  #render() {
    const badge = this.#find(".badge");
    badge.hidden = this.#count === 0;
    badge.textContent = String(this.#count);

    this.#find(".panel").hidden = !this.#open;
    if (!this.#open) {
      this.#renderedSignature = "";
      return;
    }
    // polls repeat every 2 seconds; rebuild only when something changed, so
    // the scroll position and any selected text survive
    const signature = JSON.stringify([
      this.#selectedId,
      this.#entries.map((entry) => entry.id),
    ]);
    if (signature === this.#renderedSignature) {
      return;
    }
    this.#renderedSignature = signature;
    this.#find('[data-action="clear"]').disabled = this.#entries.length === 0;
    const body = this.#find(".body");
    const selected = this.#entries.find(({ id }) => id === this.#selectedId);
    const scrollTop = selected ? 0 : body.scrollTop;
    body.innerHTML = selected
      ? EventDetails(selected, this.#names)
      : EventList(this.#entries, this.#names);
    body.scrollTop = scrollTop;
  }
}

customElements.define("paypal-webhook-assistant", WebhookAssistant);
