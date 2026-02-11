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
        },
        payee: {
          merchant_id: "87P7VGGN5HG8U"
        },
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
  const { countryCode, currencyCode } = initializeCountryAndCurrencyCodes({
    defaultCountryCode: "DE",
    defaultCurrencyCode: "EUR",
  });
  const sdkInstance = await window.paypal.createInstance({
    ...auth,
    components: ["skrill-payments"],
    testBuyerCountry: countryCode,
  });
  initializeLocale({
    sdkInstance,
    setMessage,
  });
  const paymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: currencyCode,
  });
  const isSkrillEligible = paymentMethods.isEligible("skrill");
  if (isSkrillEligible) {
    const createOrder = buildCreateOrderFunction(currencyCode);
    const skrillCheckout = sdkInstance.createSkrillOneTimePaymentSession({
      onApprove,
      onCancel,
      onError
    });
    const fullnameField = skrillCheckout.createPaymentFields({
      type: "name",
      value: fullnameValue,
    });
    document.querySelector("#skrill-full-name").appendChild(fullnameField);
    const skrillButton = document.querySelector("#skrill-button");
    skrillButton.removeAttribute("hidden");
    async function onClick() {
      try {
        const valid = await skrillCheckout.validate();
        if(valid) {
          await skrillCheckout.start(
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
    skrillButton.addEventListener("click", onClick);
  }
})();
