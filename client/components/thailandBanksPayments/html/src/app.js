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
const { auth, clientName } = await initAuth("THAILAND_BANKS");
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

let fullnameValue;
// ...existing code...
(async () => {
  if (fullnameValue) {
    document.querySelector("#prefill-full-name").checked = true;
  }
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
    defaultCountryCode: "TH",
    defaultCurrencyCode: "THB",
  });
  const sdkInstance = await window.paypal.createInstance({
    ...auth,
    components: ["thailand-banks-payments"],
    testBuyerCountry: countryCode,
  });
  const paymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: currencyCode,
  });
  const isThailandBanksEligible = paymentMethods.isEligible("thailand_banks");
  if (isThailandBanksEligible) {
    const createOrder = createOrderFactory(currencyCode);
    const thailandBanksCheckout = sdkInstance.createThailandBanksOneTimePaymentSession({
      onApprove,
      onCancel,
      onError
    });
    const fullnameField = thailandBanksCheckout.createPaymentFields({
      type: "name",
      value: fullnameValue,
    });
    document.querySelector("#thailand-banks-full-name").appendChild(fullnameField);
    const thailandBanksButton = document.querySelector("#thailand-banks-button");
    thailandBanksButton.removeAttribute("hidden");
    async function onClick() {
      try {
        const valid = await thailandBanksCheckout.validate();
        if(valid) {
          await thailandBanksCheckout.start(
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
    thailandBanksButton.addEventListener("click", onClick);
  }
  document.querySelector("#update-locale").addEventListener("change", async (event) => {
    const newLocale = event.target.value;
    sdkInstance.updateLocale(newLocale);
    setMessage(`Locale updated to ${newLocale}`);
  });
})();
