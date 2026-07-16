/**
 * Bank ACH Wallet One-Time Payment Integration
 *
 * This module accepts ACH direct debit payments using PayPal's v6 Web SDK and
 * the PayPal-hosted `bank-ach-wallet-payments` element. Buyers can link a bank
 * account through Open Banking or pay with a bank account saved in their PayPal
 * Wallet. This flow requires a client token because the SDK looks up the buyer's
 * saved bank account in their PayPal Wallet.
 */

/**
 * Main setup function called when the PayPal Web SDK is loaded.
 * Creates the SDK instance, checks ACH eligibility, and wires up the element.
 *
 * @returns {Promise<void>}
 */
async function onPayPalWebSdkLoaded() {
  try {
    // This integration requires a client token. Because the SDK looks up the
    // buyer's saved bank account in their PayPal Wallet, client-ID-only
    // integrations are not supported for the ACH wallet flow.
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      // A unique identifier for this checkout session, used for risk evaluation
      clientMetadataId: crypto.randomUUID(),
      components: ["bank-ach-payments"],
      pageType: "checkout",
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "USD",
      paymentFlow: "ONE_TIME_PAYMENT",
      amount: "100.00",
    });

    if (paymentMethods.isEligible("ach")) {
      configureBankAchWalletPayment(sdkInstance);
    } else {
      renderAlert({ type: "warning", message: "Bank ACH is not eligible" });
    }
  } catch (error) {
    renderAlert({
      type: "danger",
      message: `Bank ACH setup failed: ${error.message}`,
    });
    console.error(error);
  }
}

/**
 * Creates the ACH wallet payment session and connects the
 * `bank-ach-wallet-payments` element to a lazy order-creation callback.
 *
 * @param {Object} sdkInstance - PayPal SDK instance
 * @returns {void}
 */
function configureBankAchWalletPayment(sdkInstance) {
  const walletSession = sdkInstance.createBankAchWalletPaymentSession({
    // Optional NACHA Standard Entry Class (SEC) code. Defaults to "WEB".
    standardEntryClassCode: "WEB",
    async onApprove(data) {
      console.log("onApprove", data);
      try {
        // The single capture endpoint retrieves the order details, stores the
        // buyer's authorization (consent) record for NACHA compliance, and
        // captures the payment.
        const orderData = await captureOrder({ orderId: data.orderId });
        renderAlert({
          type: "success",
          message: `Order successfully captured! ${JSON.stringify(data)}`,
        });
        console.log("Capture result", orderData);
      } catch (error) {
        renderAlert({
          type: "danger",
          message: `Payment capture failed: ${error.message}`,
        });
        console.error(error);
      }
    },
    onError(error) {
      renderAlert({
        type: "danger",
        message: `onError() callback called: ${error.message ?? error}`,
      });
      console.log("onError", error);
    },
  });

  const bankAchWalletElement = document.querySelector(
    "bank-ach-wallet-payments",
  );
  bankAchWalletElement.removeAttribute("hidden");

  // Connect the rendered element with a lazy order-creation callback. The SDK
  // calls the callback only when the buyer proceeds with the payment flow.
  const createOrderSession = () => createOrder();
  walletSession.connect("bank-ach-wallet-payments", createOrderSession);
}

/**
 * Fetches a browser-safe client token from the server.
 *
 * @returns {Promise<string>} The client token access token
 * @throws {Error} If the request fails
 */
async function getBrowserSafeClientToken() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch client token");
  }
  const { accessToken } = await response.json();

  return accessToken;
}

/**
 * Creates an order on the server for the one-time ACH payment.
 *
 * @returns {Promise<{orderId: string}>} The created order ID
 * @throws {Error} If order creation fails
 */
async function createOrder() {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-one-time-payment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Order creation failed ${data ? JSON.stringify(data) : ""}`,
    );
  }

  renderAlert({
    type: "info",
    message: `Order successfully created: ${data.id}`,
  });

  return { orderId: data.id };
}

/**
 * Captures the approved order via the single ACH wallet capture endpoint, which
 * also stores the buyer's authorization (consent) record for NACHA compliance.
 *
 * @param {Object} params
 * @param {string} params.orderId - The approved order ID to capture
 * @returns {Promise<Object>} The capture result
 * @throws {Error} If the capture fails
 */
async function captureOrder({ orderId }) {
  const response = await fetch(
    `/paypal-api/checkout/orders/${orderId}/capture-ach-wallet`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Order capture failed ${data?.name ?? ""}`);
  }

  return data;
}

/**
 * Renders a message in the shared alert component.
 *
 * @param {Object} params
 * @param {("success"|"info"|"warning"|"danger")} params.type - Alert type
 * @param {string} params.message - Message to display
 * @returns {void}
 */
function renderAlert({ type, message }) {
  const alertComponentElement = document.querySelector("alert-component");
  if (!alertComponentElement) {
    return;
  }

  alertComponentElement.setAttribute("type", type);
  alertComponentElement.innerText = message;
}
