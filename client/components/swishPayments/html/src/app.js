import {
  createOrder as createOrderHelper,
  captureOrder,
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

function buildCreateOrderFunction(currencyCode, countryCode) {
  return async function createOrder() {
    setMessage("Creating order...");
    const orderPayload = {
      intent: "CAPTURE",
      payer: {
        name: {
          given_name: "Carlos",
          surname: "Abejundio"
        }
      },
      processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
      purchase_units: [
        {
          reference_id: "#0000",
          description: "Items bought at Hemm Store",
          custom_id: "#1111",
          soft_descriptor: "ABC",
          amount: {
            currency_code: currencyCode,
            value: "1000",
            breakdown: {
              item_total: {
                currency_code: currencyCode,
                value: "980"
              },
              tax_total: {
                currency_code: currencyCode,
                value: "20"
              }
            }
          },
          shipping: {
            address: {
              address_line_1: "595343 / 86693 West Elm",
              admin_area_2: "Stockholm",
              postal_code: "SE-113 49",
              country_code: countryCode
            }
          }
        }
      ]
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
  setMessage(`Capturing order ${data.orderId}...`);
  const orderData = await captureOrder({
    orderId: data.orderId,
    headers: { "X-CSRF-TOKEN": "" },
    clientName,
  });
  console.log("Capture result", orderData);
  setMessage(JSON.stringify(orderData, null, 2));
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
    defaultCountryCode: "SE",
    defaultCurrencyCode: "SEK",
  });

  const sdkInstance = await window.paypal.createInstance({
    ...auth,
    components: ["swish-payments"],
    testBuyerCountry: countryCode,
  });

  const paymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: currencyCode,
  });

  const isSwishEligible = paymentMethods.isEligible("swish");

  if (isSwishEligible) {
    const createOrder = buildCreateOrderFunction(currencyCode, countryCode);
    const swishCheckout = sdkInstance.createSwishOneTimePaymentSession({
      onApprove,
      onCancel,
      onError
    });

    const fullNameField = swishCheckout.createPaymentFields({
      type: "name",
      value: fullName,
    });
    document.querySelector("#swish-full-name").appendChild(fullNameField);

    async function onClick() {
      try {
        const valid = await swishCheckout.validate();
        if (valid) {
          await swishCheckout.start(
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

    const swishButton = document.querySelector("#swish-button");
    swishButton.removeAttribute("hidden");
    swishButton.addEventListener("click", onClick);
  }

  document.querySelector("#update-locale").addEventListener("change", async (event) => {
    const newLocale = event.target.value;
    sdkInstance.updateLocale(newLocale);
    setMessage(`Locale updated to ${newLocale}`);
  });
})();
