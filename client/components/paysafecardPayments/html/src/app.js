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
          merchant_id: "U83XRVL67BW2J"
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
    const orderData = await getOrder({
      orderId: data.orderId,
      headers: { "X-CSRF-TOKEN": "" },
      clientName
    });
    console.log("Order details ", orderData);
    setMessage(JSON.stringify(orderData, null, 2));
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
    defaultCountryCode: "DE",
    defaultCurrencyCode: "EUR",
  });
  const sdkInstance = await window.paypal.createInstance({
    ...auth,
    components: ["paysafecard-payments"],
    testBuyerCountry: countryCode,
  });
  initializeLocale({
    sdkInstance,
    setMessage,
  });
  const paymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: currencyCode,
  });
  const isPaysafecardEligible = paymentMethods.isEligible("paysafecard");
  if (isPaysafecardEligible) {
    const createOrder = buildCreateOrderFunction(currencyCode);
    const paysafecardCheckout = sdkInstance.createPaysafecardOneTimePaymentSession({
      onApprove,
      onCancel,
      onError
    });
    const fullnameField = paysafecardCheckout.createPaymentFields({
      type: "name",
      value: fullName,
    });
    document.querySelector("#paysafecard-full-name").appendChild(fullnameField);
    const paysafecardButton = document.querySelector("#paysafecard-button");
    paysafecardButton.removeAttribute("hidden");
    async function onClick() {
      try {
        const valid = await paysafecardCheckout.validate();
        if(valid) {
          await paysafecardCheckout.start(
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
    paysafecardButton.addEventListener("click", onClick);
  }
})();
