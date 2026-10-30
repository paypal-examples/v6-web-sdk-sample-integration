export function friendlyName(type, names) {
  return Object.hasOwn(names, type) ? names[type] : type;
}

function shortId(id) {
  return id.length > 12 ? `${id.slice(0, 12)}...` : id;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour12: false });
}

// every value from an event goes through esc, since the markup is built from strings
const esc = (value) =>
  String(value).replace(
    /[&<>"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character],
  );

const WEBHOOK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5.5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M11 8 6.5 15.5M7.5 18h9M14.2 9.2l3.3 6"/></svg>`;

export const WebhookFAB = () => `
  <button class="fab" data-action="toggle">
    ${WEBHOOK_ICON}<span class="badge" hidden></span>
  </button>`;

export const WebhookToast = () => `
  <div class="toast" hidden>
    <button class="open" data-action="open-toast">
      <span class="title">Webhook received</span>
      <span class="name"></span>
      <span class="type mono"></span>
    </button>
    <button class="close" data-action="close-toast">×</button>
    <div class="bar"></div>
  </div>`;

export const WebhookInbox = () => `
  <section class="panel" hidden>
    <div class="head">
      <h3>Webhook inbox</h3>
      <span>
        <button class="link" data-action="clear">Clear all</button>
        <button class="link" data-action="close">Close</button>
      </span>
    </div>
    <div class="body"></div>
    <div class="foot">Temporary · last 25 events · cleared when the app restarts</div>
  </section>`;

export function EventList(entries, names) {
  if (entries.length === 0) {
    return `<div class="empty">Waiting for webhook events</div>`;
  }
  return entries
    .map(
      (entry) => `
        <button class="row" data-action="select" data-id="${esc(entry.id)}">
          <span class="top">
            <span class="name">${esc(friendlyName(entry.type, names))}</span>
            <span class="time mono">${esc(formatTime(entry.receivedAt))}</span>
          </span>
          <span class="sub mono">${esc(entry.type)} · ${esc(shortId(entry.id))}</span>
        </button>`,
    )
    .join("");
}

export const EventDetails = (entry, names) => `
  <div class="back"><button class="link" data-action="back">← Back to events</button></div>
  <h3>${esc(friendlyName(entry.type, names))}</h3>
  <dl>
    <dt>Event type</dt><dd class="mono">${esc(entry.type)}</dd>
    <dt>Event ID</dt><dd class="mono">${esc(entry.id)}</dd>
    <dt>Received</dt><dd class="mono">${esc(entry.receivedAt)}</dd>
  </dl>
  <pre class="mono">${esc(JSON.stringify(entry.payload, null, 2))}</pre>
  <button class="copy" data-action="copy">Copy payload</button>`;

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  }
}
