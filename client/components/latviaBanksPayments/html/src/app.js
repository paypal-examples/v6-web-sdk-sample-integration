import {
  createOrder as createOrderHelper,
  getOrder,
  initAuth,
} from "/web-sdk/demo/assets/js/ordersApiFetchHelpers.mjs";
import { initializeCountryAndCurrencyCodes, initializeLocale } from "/web-sdk/demo/assets/js/lpmHelpers.mjs";

function setMessage(message) {
  document.querySelector("#message").textContent = message;
  console.log(message);
}

setMessage("Fetching auth...");
const { auth, clientName } = await initAuth("LPM");
setMessage("Auth ready: " + (auth.clientId ? "clientId" : "clientToken"));

function createOrderFactory(currencyCode) {
  return async function createOrder() {
    setMessage("Creating order...");
    const orderPayload = {
      intent: "CAPTURE",
      processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
      purchase_units: [
        {
          amount: {
            currency_code: currencyCode,
            value: "10.00",
          },
        },
      ],
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
  let fullName;
  const prefillCheckbox = document.querySelector("#prefill-full-name");
  prefillCheckbox.addEventListener("change", () => {
    const searchParams = new URLSearchParams(window.location.search);
    if (prefillCheckbox.checked) {
      searchParams.append("prefillName", "true");
    } else {
      searchParams.delete("prefillName");
    }
    window.location.href = window.location.pathname + "?" + searchParams.toString();
  });
  const { countryCode, currencyCode } = initializeCountryAndCurrencyCodes({
    defaultCountryCode: "LV",
    defaultCurrencyCode: "EUR",
  });
  while (!window.paypal || !window.paypal.createInstance) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  const sdkInstance = await window.paypal.createInstance({
    ...auth,
    components: ["latviabanks-payments"],
    testBuyerCountry: countryCode,
  });
  initializeLocale({
    sdkInstance,
    setMessage,
  });
  const paymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: currencyCode,
  });
  const isLatviaBanksEligible = paymentMethods.isEligible("latvia_banks");
  if (isLatviaBanksEligible) {
    const createOrder = createOrderFactory(currencyCode);
    const latviabanksCheckout = sdkInstance.createLatviaBanksOneTimePaymentSession({
      onApprove,
      onCancel,
      onError
    });
    const fullNameField = latviabanksCheckout.createPaymentFields({
      type: "name",
      value: fullName,
    });
    document.querySelector("#latviabanks-full-name").appendChild(fullNameField);
    async function onClick() {
      try {
        const valid = await latviabanksCheckout.validate();
        if(valid) {
          await latviabanksCheckout.start(
            { presentationMode: "popup" },
            createOrder()
          );
        } else {
          setMessage("validation failed");
        }
      } catch (e) {
        console.error(e);
        setMessage(e.message || "Validation failed");
      }
    }
    const latviaBanksButton = document.querySelector("#latviabanks-button");
    latviaBanksButton.removeAttribute("hidden");
    latviaBanksButton.addEventListener("click", onClick);
  }
  document.querySelector("#update-locale").addEventListener("change", async (event) => {
    const newLocale = event.target.value;
    sdkInstance.updateLocale(newLocale);
    setMessage(`Locale updated to ${newLocale}`);
  });
})();
