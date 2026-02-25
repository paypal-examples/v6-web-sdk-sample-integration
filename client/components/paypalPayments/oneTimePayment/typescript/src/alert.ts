type RenderAlertOptions = {
  type: "success" | "info" | "warning" | "danger";
  message: string;
};

export function renderAlert({ type, message }: RenderAlertOptions) {
  const alertComponentElement =
    document.querySelector<HTMLElement>("alert-component");
  if (!alertComponentElement) {
    return;
  }

  alertComponentElement.setAttribute("type", type);
  alertComponentElement.textContent = message;
}
