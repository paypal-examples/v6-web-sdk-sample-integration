class AlertComponent extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    // styles
    const styleElement = document.createElement("style");
    styleElement.textContent = AlertComponent.styles;
    shadowRoot.appendChild(styleElement);

    // html
    const alertContainerElement = document.createElement("div");
    alertContainerElement.id = "alert-container";
    alertContainerElement.setAttribute("role", "alert");
    alertContainerElement.innerHTML = `
      <div id="icon-container"></div>
      <slot></slot>
    `;

    shadowRoot.appendChild(alertContainerElement);
  }

  static observedAttributes = ["type"];

  static styles = `
    :host {
      --success-color: #084a22;
      --success-background-color: #d0f1dd;
      --success-border-color: #a1e3bb;

      --info-color: #003e58;
      --info-background-color: #ccebf8;
      --info-border-color: #99d7f1;

      --warning-color: #60410c;
      --warning-background-color: #fcedd2;
      --warning-border-color: #f9daa5;

      --danger-color: #651717;
      --danger-background-color: #fed7d7;
      --danger-border-color: #feb0b0;

      display: block;
      margin: 1rem 0;
    }
    #alert-container {
      display: flex;
      align-items: center;
      text-align: left;
      border-radius: 0.5rem;
      padding: 1rem;
      border-width: 1px;
      overflow-wrap: anywhere;
    }
    #icon-container {
      line-height: 0;
    }
    #icon-container svg {
      width: 1.5rem;
      height: 1.5rem;
      margin-right: 0.5rem;
      flex-shrink: 0;
    }
    .alert-success {
      color: var(--success-color);
      background-color: var(--success-background-color);
      border-color: var(--success-border-color);
    }
    .alert-info {
      color: var(--info-color);
      background-color: var(--info-background-color);
      border-color: var(--info-border-color);
    }
    .alert-warning {
      color: var(--warning-color);
      background-color: var(--warning-background-color);
      border-color: var(--warning-border-color);
    }
    .alert-danger {
      color: var(--danger-color);
      background-color: var(--danger-background-color);
      border-color: var(--danger-border-color);
    }
    .alert-unknown {
      display: none !important;
    }
  `;

  get #alertType() {
    const type = this.getAttribute("type");
    return type ?? "unknown";
  }

  get #icon() {
    // svg icons copied from https://heroicons.com/
    let svgIcon = "";

    switch (this.#alertType) {
      case "success":
        // check-circle
        svgIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        `;
        break;
      case "info":
        // information-circle
        svgIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
        `;
        break;
      case "warning":
      case "danger":
        // exclamation-circle
        svgIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        `;
        break;
      case "unknown":
        svgIcon = "";
        break;

      default:
        throw new Error("Invalid alert type");
    }

    return svgIcon;
  }

  render() {
    const alertContainerElement =
      this.shadowRoot.querySelector("#alert-container");
    if (!alertContainerElement) {
      return;
    }

    const iconContainerElement =
      alertContainerElement.querySelector("#icon-container");
    iconContainerElement.innerHTML = this.#icon;

    alertContainerElement.className = `alert-${this.#alertType}`;
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }
}

window.customElements.define("alert-component", AlertComponent);
