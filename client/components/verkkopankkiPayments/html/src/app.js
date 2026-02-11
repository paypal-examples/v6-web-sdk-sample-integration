import {
  createOrder as createOrderHelper,
  getOrder,
  initAuth,
} from "/web-sdk/demo/assets/js/ordersApiFetchHelpers.mjs";
import { initializeCountryAndCurrencyCodes } from "/web-sdk/demo/assets/js/lpmHelpers.mjs";

function setMessage(message) {
  document.querySelector("#message").textContent = message;
  console.log(message);
}

setMessage("Fetching auth...");
const { auth, clientName } = await initAuth("LPM");
setMessage("Auth ready: " + (auth.clientId ? "clientId" : "clientToken"));

function buildCreateOrderFunction(currencyCode) {
  return async function createOrder() {
    setMessage("Creating order...");
    const orderPayload = {
      intent: "CAPTURE",
      processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
      purchase_units: [{
        amount: {
          currency_code: currencyCode,
          value: "10.00"
        }
      }]
    };

    const { id: orderId } = await createOrderHelper({
      headers: { "X-CSRF-TOKEN": "" },
      body: orderPayload,
      clientName,
    });

    setMessage(`Order ${orderId}`);
    return { orderId };
  };
}

async function onApprove(data) {
  console.log("onApprove", data);
  setMessage(`Fetching order details for ${data.orderId}...`);
  try {
    const orderDetails = await getOrder({
      orderId: data.orderId,
      headers: { "X-CSRF-TOKEN": "" },
      clientName,
    });
    console.log("Order details", orderDetails);
    setMessage(JSON.stringify(orderDetails, null, 2));
  } catch (error) {
    console.error("Error fetching order details:", error);
    setMessage(`Transaction Successful but failed to fetch order details: ${error.message}`);
  }
}

function onCancel(data) {
  console.log("onCancel", data);
  let message = "Canceled order";
  if (data) {
    message += ` ${data.orderId}`;
  }
  setMessage(message);
}

function onError(data) {
  console.log("onError", data);
  setMessage(data);
}

(async () => {
  let fullnameValue;
  let emailValue;

  const prefillNameCheckbox = document.querySelector("#prefill-full-name");
  prefillNameCheckbox.addEventListener("change", () => {
    const searchParams = new URLSearchParams(window.location.search);
    if (prefillNameCheckbox.checked) {
      searchParams.append("prefillName", "true");
    } else {
      searchParams.delete("prefillName");
    }
    window.location.href = window.location.pathname + "?" + searchParams.toString();
  });

  const prefillEmailCheckbox = document.querySelector("#prefill-email");
  prefillEmailCheckbox.addEventListener("change", () => {
    const searchParams = new URLSearchParams(window.location.search);
    if (prefillEmailCheckbox.checked) {
      searchParams.append("prefillEmail", "true");
    } else {
      searchParams.delete("prefillEmail");
    }
    window.location.href = window.location.pathname + "?" + searchParams.toString();
  });

  const { countryCode, currencyCode } = initializeCountryAndCurrencyCodes({
    defaultCountryCode: "FI",
    defaultCurrencyCode: "EUR",
  });

  const sdkInstance = await window.paypal.createInstance({
    ...auth,
    components: ["verkkopankki-payments"],
    testBuyerCountry: countryCode,
  });

  const paymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: currencyCode,
  });

  const isVerkkopankkiEligible = paymentMethods.isEligible("verkkopankki");

  if (isVerkkopankkiEligible) {
    const createOrder = buildCreateOrderFunction(currencyCode);
    const verkkopankkiCheckout = sdkInstance.createVerkkopankkiOneTimePaymentSession({
      onApprove,
      onCancel,
      onError
    });
    const fullnameField = verkkopankkiCheckout.createPaymentFields({
      type: "name",
      value: fullnameValue,
    });
    document.querySelector("#verkkopankki-full-name").appendChild(fullnameField);
    const emailField = verkkopankkiCheckout.createPaymentFields({
      type: "email",
      value: emailValue,
    });
    document.querySelector("#verkkopankki-email").appendChild(emailField);
    async function onClick() {
      try {
        const valid = await verkkopankkiCheckout.validate();
        if(valid) {
          await verkkopankkiCheckout.start(
            { presentationMode: "popup" },
            createOrder()
          );
        } else {
          setMessage("validation failed");
        }
      } catch (e) {
        console.error(e);
      }
    }
    const verkkopankkiButton = document.querySelector("#verkkopankki-button");
    verkkopankkiButton.removeAttribute("hidden");
    verkkopankkiButton.addEventListener("click", onClick);
  }

  document.querySelector("#update-locale").addEventListener("change", async (event) => {
    const newLocale = event.target.value;
    sdkInstance.updateLocale(newLocale);
    setMessage(`Locale updated to ${newLocale}`);
  });
})();
