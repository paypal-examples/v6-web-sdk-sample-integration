/**
 * PayPal Webhook Assistant
 *
 * WHY THIS FILE EXISTS:
 * One shared, dependency-free implementation of the webhook event experience
 * used by every PayPal SDK sample: a floating button (FAB) with a new-event
 * count, a single toast for the latest event, and a webhook inbox with an
 * event list and an event-detail view.
 *
 * Usage (any stack — plain HTML, Next.js, React, Vue):
 *   <script type="module" src="…/webhook-assistant.js"></script>
 *   <paypal-webhook-assistant endpoint="/api/dev/webhooks"></paypal-webhook-assistant>
 *
 * The sample supplies only the event-data endpoint and, optionally, a map of
 * canonical event types to friendly names (the `names` attribute as JSON, or
 * `names` in the endpoint response, which wins).
 *
 * Endpoint contract:
 *   GET    {endpoint}              -> { entries: Event[], names?: {[type]: string}, now: string }
 *   DELETE {endpoint}?through=<id> -> 204, removes that event and every older one
 *   Event = { id, type, receivedAt (ISO 8601 UTC), payload }
 *
 * The browser keeps no event data. It stores two small markers (an event ID
 * and time) so the new-event count and the toast survive reloads and page
 * navigation.
 *
 * SOURCE OF TRUTH:
 * This file in paypal-open-commerce-nextjs/lib/dev/ of
 * OnePayPalQA/paypal-open-apps-example is the canonical copy. Other samples
 * (for example v6-web-sdk-sample-integration/client/shared/) copy it byte for
 * byte. Keep it a single self-contained ES module: no imports, no build step,
 * no framework. When you change it, bump WEBHOOK_ASSISTANT_VERSION and copy
 * it to the other samples.
 *
 * Sizing: every size is a base size times one factor that steps up with the
 * viewport width (x1 below 1280px, up to x1.5 at 2560px). Hosts can multiply
 * it with the CSS variable --wh-scale and move the button with
 * --wh-offset-right / --wh-offset-bottom.
 */

export const WEBHOOK_ASSISTANT_VERSION = "1.0.4";
export const ELEMENT_NAME = "paypal-webhook-assistant";
export const POLL_INTERVAL_MS = 2000;
export const TOAST_DURATION_MS = 5000;
export const MAX_EVENTS = 25;
export const STORAGE_KEYS = Object.freeze({
  seen: "paypal-webhook-assistant:v1:seen",
  toasted: "paypal-webhook-assistant:v1:toasted",
});

/* ------------------------------------------------------------------------ */
/* Pure logic (exported for tests; no DOM access)                            */
/* ------------------------------------------------------------------------ */

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Keeps only well-formed events, newest first, at most MAX_EVENTS. */
export function normalizeEntries(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter(
      (entry) =>
        isPlainObject(entry) &&
        typeof entry.id === "string" &&
        entry.id !== "" &&
        typeof entry.type === "string" &&
        typeof entry.receivedAt === "string" &&
        isPlainObject(entry.payload),
    )
    .slice(0, MAX_EVENTS);
}

/** Merges the attribute map with the response map; the response wins. */
export function mergeNames(attributeNames, responseNames) {
  const merged = {};
  for (const source of [attributeNames, responseNames]) {
    if (!isPlainObject(source)) {
      continue;
    }
    for (const [type, name] of Object.entries(source)) {
      if (typeof name === "string" && name.trim() !== "") {
        merged[type] = name.trim();
      }
    }
  }
  return merged;
}

export function friendlyName(type, names) {
  const name =
    isPlainObject(names) && Object.prototype.hasOwnProperty.call(names, type)
      ? names[type]
      : null;
  return typeof name === "string" && name !== "" ? name : type;
}

export function shortId(id) {
  return id.length > 12 ? `${id.slice(0, 12)}…` : id;
}

/** Marker for an entry: just its ID and receipt time. */
export function markerFor(entry) {
  return entry ? { id: entry.id, receivedAt: entry.receivedAt } : null;
}

function isMarker(value) {
  return (
    isPlainObject(value) &&
    typeof value.id === "string" &&
    typeof value.receivedAt === "string"
  );
}

/**
 * A marker names one recording of an event. After Clear all the feed can
 * record the same event ID again with a new receipt time, and that counts as a
 * new event.
 */
function isSameEvent(entry, marker) {
  return entry.id === marker.id && entry.receivedAt === marker.receivedAt;
}

/**
 * New-event count: events above the seen marker in the newest-first list.
 * If the marker's event is gone (cleared, evicted, server restarted), count
 * events received after the marker's time. No marker: every event is new.
 */
export function countNew(entries, seen) {
  if (!isMarker(seen)) {
    return entries.length;
  }
  const index = entries.findIndex((entry) => isSameEvent(entry, seen));
  if (index !== -1) {
    return index;
  }
  return entries.filter((entry) => entry.receivedAt > seen.receivedAt).length;
}

/**
 * Which event, if any, to toast after a poll. Only the newest event is ever
 * toasted. On a fresh page or a fresh tab it must also be recent (under
 * TOAST_DURATION_MS old by the server clock), so history never replays but an
 * event that arrived during a redirect still gets its toast.
 */
export function toastCandidate(entries, toasted, now, firstPoll) {
  const top = entries[0];
  if (!top) {
    return null;
  }
  const hasMarker = isMarker(toasted);
  const isNewer =
    !hasMarker ||
    (!isSameEvent(top, toasted) && top.receivedAt > toasted.receivedAt);
  if (!isNewer) {
    return null;
  }
  if (firstPoll || !hasMarker) {
    const age = Date.parse(now) - Date.parse(top.receivedAt);
    if (!(age >= 0 && age < TOAST_DURATION_MS)) {
      return null;
    }
  }
  return top;
}

/** Storage wrapper: JSON values, never throws, falls back to memory. */
export function createMarkerStore(getStorage) {
  const memory = new Map();
  let storage = null;
  try {
    storage = getStorage() ?? null;
  } catch {
    storage = null;
  }
  return {
    get(key) {
      try {
        if (storage) {
          const raw = storage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        }
      } catch {
        // Blocked or corrupt storage: fall through to memory.
      }
      return memory.get(key) ?? null;
    },
    set(key, value) {
      memory.set(key, value);
      try {
        storage?.setItem(key, JSON.stringify(value));
      } catch {
        // Blocked storage: memory still holds the value.
      }
    },
  };
}

/** Builds the DELETE URL for Clear all, keeping any existing query string. */
export function clearUrl(endpoint, throughId, base) {
  const url = new URL(endpoint, base);
  url.searchParams.set("through", throughId);
  return url.toString();
}

export function formatTime(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleTimeString([], { hour12: false });
}

/* ------------------------------------------------------------------------ */
/* View (browser only)                                                       */
/* ------------------------------------------------------------------------ */

const STYLES = `
:host { all: initial; }
* { box-sizing: border-box; }
/* Sizes are in em of the root font (14px x scale), so one factor scales
   everything. Elements with their own font-size use em of that size. */
.root {
  --wh-s: var(--wh-scale, 1);
  --wh-fab: 4em;
  --wh-right: var(--wh-offset-right, 1.714em);
  --wh-bottom: var(--wh-offset-bottom, 1.714em);
  --wh-above-fab: calc(var(--wh-bottom) + var(--wh-fab) + 1.143em);
  --wh-blue: #0f4bff;
  --wh-bg: #ffffff;
  --wh-fg: #111111;
  --wh-mute: #5f6368;
  --wh-line: #e5e5e5;
  --wh-code: #f6f6f6;
  --wh-hover: #f2f2f2;
  font: calc(14px * var(--wh-s))/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: var(--wh-fg);
}
@media (min-width: 1280px) { .root { --wh-s: calc(1.15 * var(--wh-scale, 1)); } }
@media (min-width: 1600px) { .root { --wh-s: calc(1.3 * var(--wh-scale, 1)); } }
@media (min-width: 1920px) { .root { --wh-s: calc(1.4 * var(--wh-scale, 1)); } }
@media (min-width: 2560px) { .root { --wh-s: calc(1.5 * var(--wh-scale, 1)); } }
@media (prefers-color-scheme: dark) {
  .root {
    --wh-bg: #0b0b0b;
    --wh-fg: #f5f5f5;
    --wh-mute: #a3a3a3;
    --wh-line: #262626;
    --wh-code: #000000;
    --wh-hover: #151515;
  }
}
button { font: inherit; color: inherit; cursor: pointer; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.fab {
  position: fixed; right: var(--wh-right); bottom: var(--wh-bottom);
  width: var(--wh-fab); height: var(--wh-fab); border-radius: 50%; border: 0;
  background: var(--wh-blue); color: #fff; display: grid; place-items: center;
  box-shadow: 0 6px 20px rgba(0,0,0,.35); z-index: 2147483000;
}
.fab svg { width: 1.857em; height: 1.857em; }
.badge {
  position: absolute; top: -.333em; right: -.333em; min-width: 1.833em; height: 1.833em;
  padding: 0 .5em; border-radius: .917em; background: #fff; color: var(--wh-blue);
  font-weight: 700; font-size: .857em; display: grid; place-items: center;
  border: 2px solid var(--wh-blue);
}
.badge[hidden] { display: none; }
.toast {
  position: fixed; right: var(--wh-right); bottom: var(--wh-above-fab);
  width: 24.286em; max-width: calc(100vw - 32px); background: var(--wh-bg);
  color: var(--wh-fg); border: 1px solid var(--wh-line); border-radius: .714em;
  padding: 1em 2.286em 1.143em 1.143em; box-shadow: 0 10px 30px rgba(0,0,0,.35);
  z-index: 2147483002; cursor: pointer; overflow: hidden; text-align: left;
}
.toast[hidden] { display: none; }
.toast .open {
  display: block; width: 100%; text-align: left; background: none; border: 0;
  padding: 0; color: inherit;
}
.toast .open > span { display: block; }
.toast .title { margin: 0 0 .267em; font-size: 1.071em; font-weight: 700; }
.toast .name { font-weight: 600; }
.toast .type { color: var(--wh-blue); font-size: .857em; margin-top: .167em; word-break: break-all; }
.toast .close {
  position: absolute; top: .333em; right: .444em; border: 0; background: none;
  color: var(--wh-mute); font-size: 1.286em; line-height: 1;
}
.toast .bar { position: absolute; left: 0; bottom: 0; height: .214em; width: 100%; background: var(--wh-blue); }
.panel {
  position: fixed; right: var(--wh-right); bottom: var(--wh-above-fab);
  width: 30em; max-width: calc(100vw - 32px); max-height: 70vh; display: flex;
  flex-direction: column; background: var(--wh-bg); color: var(--wh-fg);
  border: 1px solid var(--wh-line); border-radius: .857em;
  box-shadow: 0 14px 40px rgba(0,0,0,.45); z-index: 2147483001;
}
.panel[hidden] { display: none; }
.head { display: flex; justify-content: space-between; align-items: center; padding: 1.143em 1.286em .714em; }
.head h3 { margin: 0; font-size: 1.214em; }
.link { background: none; border: 0; color: var(--wh-mute); font-size: .929em; padding: 0; }
.link:hover { color: var(--wh-fg); }
.link:disabled { opacity: .4; cursor: default; }
.link:disabled:hover { color: var(--wh-mute); }
.link + .link { margin-left: .923em; }
.body { overflow: auto; padding: 0 1.286em; flex: 1; }
.row {
  display: block; width: 100%; text-align: left; background: none; border: 0;
  border-bottom: 1px solid var(--wh-line); padding: .786em 0;
}
.row:hover { background: var(--wh-hover); }
.row > span { display: block; }
.row .top { display: flex; justify-content: space-between; gap: .571em; }
.row .name { font-weight: 600; }
.row .time, .row .sub { color: var(--wh-mute); font-size: .857em; }
.row .sub { margin-top: .167em; word-break: break-all; }
.empty { padding: 2.429em 0; text-align: center; color: var(--wh-mute); }
.foot { padding: 1em 1.5em; border-top: 1px solid var(--wh-line); color: var(--wh-mute); font-size: .857em; }
.detail h3 { margin: 0 0 .125em; font-size: 1.143em; }
.detail dl { display: grid; grid-template-columns: 7.5em 1fr; gap: .5em .833em; margin: .667em 0 1em; font-size: .857em; }
.detail dt { color: var(--wh-mute); }
.detail dd { margin: 0; word-break: break-all; }
.detail pre {
  margin: 0 0 1em; background: var(--wh-code); border: 1px solid var(--wh-line);
  border-radius: .667em; padding: 1em; font-size: .857em; overflow: auto;
  max-height: 21.667em; white-space: pre;
}
.back { padding-bottom: .571em; }
.copy {
  background: var(--wh-blue); color: #fff; border: 0; border-radius: .571em;
  padding: .429em .857em; margin-bottom: 1em;
}
@media (max-width: 480px) {
  .toast, .panel { left: 16px; right: 16px; width: auto; max-width: none; }
}
`;

const WEBHOOK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5.5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M11 8 6.5 15.5M7.5 18h9M14.2 9.2l3.3 6"/></svg>`;

const FOOTER_TEXT = `Temporary · last ${MAX_EVENTS} events · cleared when the app restarts`;

/** Small element builder. Text is always set with textContent. */
function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) {
      continue;
    }
    if (key === "className") {
      node.className = value;
    } else if (key === "text") {
      node.textContent = value;
    } else if (key.startsWith("on")) {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      node.setAttribute(key, value === true ? "" : String(value));
    }
  }
  for (const child of children) {
    if (child) {
      node.append(child);
    }
  }
  return node;
}

async function copyText(text) {
  try {
    if (window.isSecureContext && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back below.
  }
  // http://lvh.me is not a secure context, so the clipboard API is absent.
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  area.remove();
  return copied;
}

/** FAB: webhook icon plus the new-event count (hidden at zero). */
function WebhookFAB(view) {
  const badge = h("span", { className: "badge", hidden: true });
  const button = h("button", {
    className: "fab",
    type: "button",
    "aria-label": "Open webhook inbox",
    onClick: () => view.toggleInbox(),
  });
  button.innerHTML = WEBHOOK_ICON;
  button.append(badge);
  return {
    node: button,
    update(count, open) {
      badge.hidden = count === 0;
      badge.textContent = count > 99 ? "99+" : String(count);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute(
        "aria-label",
        count > 0 ? `Open webhook inbox, ${count} new` : "Open webhook inbox",
      );
    },
  };
}

/** Toast: one at a time, newest event, closes after TOAST_DURATION_MS. */
function WebhookToast(view) {
  const name = h("span", { className: "name" });
  const type = h("span", { className: "type mono" });
  const bar = h("div", { className: "bar" });
  let entryId = null;
  let timer = null;

  function hide() {
    clearTimeout(timer);
    timer = null;
    entryId = null;
    node.hidden = true;
  }

  const close = h("button", {
    className: "close",
    type: "button",
    "aria-label": "Close toast",
    text: "×",
    onClick: () => hide(),
  });
  // The whole message is a button, so it works from the keyboard too.
  const open = h(
    "button",
    {
      className: "open",
      type: "button",
      onClick: () => {
        const id = entryId;
        hide();
        if (id) {
          view.openInbox(id);
        }
      },
    },
    [h("span", { className: "title", text: "Webhook received" }), name, type],
  );
  const node = h(
    "div",
    { className: "toast", role: "status", "aria-live": "polite", hidden: true },
    [open, close, bar],
  );

  return {
    node,
    hide,
    get entryId() {
      return entryId;
    },
    show(entry, names) {
      entryId = entry.id;
      name.textContent = friendlyName(entry.type, names);
      type.textContent = entry.type;
      bar.style.transition = "none";
      bar.style.width = "100%";
      void bar.offsetWidth;
      bar.style.transition = `width ${TOAST_DURATION_MS}ms linear`;
      bar.style.width = "0";
      node.hidden = false;
      clearTimeout(timer);
      timer = setTimeout(hide, TOAST_DURATION_MS);
    },
  };
}

/** Event list: newest first; name, type, time, short ID; no status. */
function EventList(view, entries, names) {
  if (entries.length === 0) {
    return h("div", { className: "empty", text: "Waiting for webhook events" });
  }
  return h(
    "div",
    {},
    entries.map((entry) =>
      h(
        "button",
        {
          className: "row",
          type: "button",
          onClick: () => view.selectEvent(entry.id),
        },
        [
          h("span", { className: "top" }, [
            h("span", { className: "name", text: friendlyName(entry.type, names) }),
            h("span", { className: "time mono", text: formatTime(entry.receivedAt) }),
          ]),
          h("span", {
            className: "sub mono",
            text: `${entry.type} · ${shortId(entry.id)}`,
          }),
        ],
      ),
    ),
  );
}

/** Event details: full ID, exact time, formatted payload, copy, back. */
function EventDetails(view, entry, names) {
  const json = JSON.stringify(entry.payload, null, 2);
  const copy = h("button", { className: "copy", type: "button", text: "Copy payload" });
  copy.addEventListener("click", async () => {
    const copied = await copyText(json);
    copy.textContent = copied ? "Copied" : "Copy failed";
    setTimeout(() => {
      if (copy.isConnected) {
        copy.textContent = "Copy payload";
      }
    }, 1500);
  });
  return h("div", { className: "detail" }, [
    h("div", { className: "back" }, [
      h("button", {
        className: "link",
        type: "button",
        text: "← Back to events",
        onClick: () => view.selectEvent(null),
      }),
    ]),
    h("h3", { text: friendlyName(entry.type, names) }),
    h("dl", {}, [
      h("dt", { text: "Event type" }),
      h("dd", { className: "mono", text: entry.type }),
      h("dt", { text: "Event ID" }),
      h("dd", { className: "mono", text: entry.id }),
      h("dt", { text: "Received" }),
      h("dd", { className: "mono", text: entry.receivedAt }),
    ]),
    h("pre", { className: "mono", text: json }),
    copy,
  ]);
}

/** Inbox panel: title, Clear all, Close, list or details, temporary note. */
function WebhookInbox(view) {
  const clear = h("button", {
    className: "link",
    type: "button",
    text: "Clear all",
    onClick: () => view.clearAll(),
  });
  const body = h("div", { className: "body" });
  const node = h(
    "section",
    { className: "panel", role: "dialog", "aria-label": "Webhook inbox", hidden: true },
    [
      h("div", { className: "head" }, [
        h("h3", { text: "Webhook inbox" }),
        h("span", {}, [
          clear,
          h("button", {
            className: "link",
            type: "button",
            text: "Close",
            onClick: () => view.closeInbox(),
          }),
        ]),
      ]),
      body,
      h("div", { className: "foot", text: FOOTER_TEXT }),
    ],
  );
  let lastSignature = "";
  return {
    node,
    update({ open, entries, names, selectedId }) {
      node.hidden = !open;
      if (!open) {
        lastSignature = "";
        return;
      }
      // Polls repeat every 2 seconds; rebuild only when something changed so
      // the developer's scroll position and text selection survive.
      const signature = JSON.stringify([
        selectedId,
        entries.map((entry) => entry.id),
        names,
      ]);
      if (signature === lastSignature) {
        return;
      }
      lastSignature = signature;
      clear.disabled = entries.length === 0;
      const selected = entries.find((entry) => entry.id === selectedId);
      const keepScroll = selected ? 0 : body.scrollTop;
      body.replaceChildren(
        selected
          ? EventDetails(view, selected, names)
          : EventList(view, entries, names),
      );
      body.scrollTop = keepScroll;
    },
  };
}

function parseNamesAttribute(value) {
  if (!value) {
    return {};
  }
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

/** Defines the custom element. Browser only; safe to call more than once. */
export function defineWebhookAssistant() {
  if (
    typeof window === "undefined" ||
    typeof customElements === "undefined" ||
    customElements.get(ELEMENT_NAME)
  ) {
    return;
  }

  class WebhookAssistant extends HTMLElement {
    constructor() {
      super();
      // Internal state uses underscore names so React (which sets a prop when
      // `prop in element`) never collides with the `endpoint` / `names`
      // attributes.
      this._entries = [];
      this._eventNames = {};
      this._open = false;
      this._selectedId = null;
      this._count = 0;
      this._firstPoll = true;
      this._inFlight = false;
      // Set when a poll is requested while one is in flight (for example the
      // refresh after Clear all), so it runs as soon as the current one ends.
      this._pollAgain = false;
      this._pollTimer = null;
      // Bumped by Clear all, so a poll that started before it cannot bring the
      // cleared events back.
      this._clearGeneration = 0;
      this._seenStore = createMarkerStore(() => window.localStorage);
      this._toastStore = createMarkerStore(() => window.sessionStorage);
      this._onVisibility = () => {
        if (document.visibilityState === "visible") {
          void this.poll();
        }
      };
      this._onStorage = (event) => {
        if (event.key === STORAGE_KEYS.seen && !this._open) {
          this._count = countNew(this._entries, this._seenStore.get(STORAGE_KEYS.seen));
          this.render();
        }
      };
      this._onKeydown = (event) => {
        if (event.key === "Escape" && this._open) {
          this.closeInbox();
        }
      };
      this._onResize = () => this.positionToast();
    }

    connectedCallback() {
      if (!this.shadowRoot) {
        const shadow = this.attachShadow({ mode: "open" });
        this._fab = WebhookFAB(this);
        this._toast = WebhookToast(this);
        this._inbox = WebhookInbox(this);
        const root = h("div", { className: "root" }, [
          this._inbox.node,
          this._toast.node,
          this._fab.node,
        ]);
        shadow.append(h("style", { text: STYLES }), root);
      }
      document.addEventListener("visibilitychange", this._onVisibility);
      document.addEventListener("keydown", this._onKeydown);
      window.addEventListener("storage", this._onStorage);
      window.addEventListener("resize", this._onResize);
      clearInterval(this._pollTimer);
      this._pollTimer = setInterval(() => void this.poll(), POLL_INTERVAL_MS);
      this.render();
      void this.poll();
    }

    disconnectedCallback() {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
      this._toast?.hide();
      document.removeEventListener("visibilitychange", this._onVisibility);
      document.removeEventListener("keydown", this._onKeydown);
      window.removeEventListener("storage", this._onStorage);
      window.removeEventListener("resize", this._onResize);
    }

    _endpoint() {
      return this.getAttribute("endpoint") || "";
    }

    async poll() {
      const endpoint = this._endpoint();
      if (!endpoint || document.visibilityState !== "visible") {
        return;
      }
      if (this._inFlight) {
        this._pollAgain = true;
        return;
      }
      this._inFlight = true;
      const generation = this._clearGeneration;
      try {
        const response = await fetch(endpoint, {
          cache: "no-store",
          credentials: "same-origin",
          // A hung request must not stop polling for good.
          signal:
            typeof AbortSignal !== "undefined" && AbortSignal.timeout
              ? AbortSignal.timeout(POLL_INTERVAL_MS * 2)
              : undefined,
        });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (generation !== this._clearGeneration) {
          return; // Started before Clear all; the list is stale.
        }
        const now = typeof data?.now === "string" ? data.now : new Date().toISOString();
        this._eventNames = mergeNames(
          parseNamesAttribute(this.getAttribute("names")),
          data?.names,
        );
        this.applyEntries(normalizeEntries(data?.entries), now);
      } catch {
        // Dev surface: stay quiet while the server restarts.
      } finally {
        this._inFlight = false;
        if (this._pollAgain) {
          this._pollAgain = false;
          void this.poll();
        }
      }
    }

    applyEntries(entries, now) {
      this._entries = entries;
      if (this._open) {
        this.markSeen();
      }
      this._count = this._open
        ? 0
        : countNew(entries, this._seenStore.get(STORAGE_KEYS.seen));

      const candidate = toastCandidate(
        entries,
        this._toastStore.get(STORAGE_KEYS.toasted),
        now,
        this._firstPoll,
      );
      if (entries[0]) {
        this._toastStore.set(STORAGE_KEYS.toasted, markerFor(entries[0]));
      }
      this._firstPoll = false;
      if (candidate) {
        this._toast.show(candidate, this._eventNames);
      }
      if (this._selectedId && !entries.some((entry) => entry.id === this._selectedId)) {
        this._selectedId = null;
      }
      this.render();
    }

    markSeen() {
      if (this._entries[0]) {
        this._seenStore.set(STORAGE_KEYS.seen, markerFor(this._entries[0]));
      }
    }

    openInbox(selectId = null) {
      this._open = true;
      this._selectedId = selectId;
      this.markSeen();
      this._count = 0;
      this.render();
    }

    closeInbox() {
      this._open = false;
      this._selectedId = null;
      this.render();
    }

    toggleInbox() {
      if (this._open) {
        this.closeInbox();
      } else {
        this.openInbox();
      }
    }

    selectEvent(id) {
      // Selection never touches the new-event count.
      this._selectedId = id;
      this.render();
    }

    clearAll() {
      const newest = this._entries[0];
      if (!newest) {
        return;
      }
      this.markSeen();
      this._clearGeneration += 1;
      this._entries = [];
      this._selectedId = null;
      this._count = 0;
      this._toast.hide();
      this.render();
      // Only the local dev feed is cleared, up to the newest event shown.
      // A failed request is harmless: the next poll shows the events again.
      void fetch(clearUrl(this._endpoint(), newest.id, window.location.href), {
        method: "DELETE",
        credentials: "same-origin",
      })
        .catch(() => {})
        .finally(() => {
          // Ignore polls that started before the DELETE settled, then refresh.
          this._clearGeneration += 1;
          void this.poll();
        });
    }

    render() {
      if (!this._fab) {
        return;
      }
      this._fab.update(this._count, this._open);
      this._inbox.update({
        open: this._open,
        entries: this._entries,
        names: this._eventNames,
        selectedId: this._selectedId,
      });
      this.positionToast();
    }

    /**
     * Keeps the toast above the FAB, or above the panel while it is open. If
     * the panel leaves no room above it, the toast moves to the top edge.
     */
    positionToast() {
      if (!this._toast) {
        return;
      }
      const toastNode = this._toast.node;
      toastNode.style.top = "";
      if (!this._open) {
        toastNode.style.bottom = "";
        return;
      }
      const panelRect = this._inbox.node.getBoundingClientRect();
      const fromBottom = Math.round(window.innerHeight - panelRect.top + 12);
      const toastHeight = toastNode.offsetHeight || 110;
      if (fromBottom + toastHeight + 8 > window.innerHeight) {
        toastNode.style.bottom = "auto";
        toastNode.style.top = "8px";
        return;
      }
      toastNode.style.bottom = `${Math.max(0, fromBottom)}px`;
    }
  }

  customElements.define(ELEMENT_NAME, WebhookAssistant);
}

defineWebhookAssistant();
