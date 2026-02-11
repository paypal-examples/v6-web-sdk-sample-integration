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
    defaultCountryCode: "CN",
    defaultCurrencyCode: "CNY",
  });

  const sdkInstance = await window.paypal.createInstance({
    ...auth,
    components: ["wechatpay-payments"],
    testBuyerCountry: countryCode,
  });

  const paymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: currencyCode,
  });

  const isWechatpayEligible = paymentMethods.isEligible("wechatpay");

  if (isWechatpayEligible) {
    const createOrder = buildCreateOrderFunction(currencyCode);
    const wechatpayCheckout = sdkInstance.createWechatpayOneTimePaymentSession({
      onApprove,
      onCancel,
      onError
    });

    const fullnameField = wechatpayCheckout.createPaymentFields({
      type: "name",
      value: fullnameValue,
    });
    document.querySelector("#wechatpay-full-name").appendChild(fullnameField);

    async function onClick() {
      try {
        const valid = await wechatpayCheckout.validate();
        if(valid) {
          await wechatpayCheckout.start(
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

    const wechatpayButton = document.querySelector("#wechatpay-button");
    wechatpayButton.removeAttribute("hidden");
    wechatpayButton.addEventListener("click", onClick);
  }

  document.querySelector("#update-locale").addEventListener("change", async (event) => {
    const newLocale = event.target.value;
    sdkInstance.updateLocale(newLocale);
    setMessage(`Locale updated to ${newLocale}`);
  });
})();
