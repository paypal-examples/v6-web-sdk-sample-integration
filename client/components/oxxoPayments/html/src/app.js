import {
  createOrder as createOrderHelper,
  getOrder,
  initAuth,
} from "/web-sdk/demo/assets/js/ordersApiFetchHelpers.mjs";
import {
  initializeCountryAndCurrencyCodes,
  initializeLocale,
} from "/web-sdk/demo/assets/js/lpmHelpers.mjs";

function setMessage(message) {
  document.querySelector("#message").textContent = message;
  console.log(message);
}

setMessage("Fetching auth...");
const { auth, clientName } = await initAuth("OXXO");
setMessage("Auth ready: " + (auth.clientId ? "clientId" : "clientToken"));

function buildCreateOrderFunction(currencyCode) {
  return async function createOrder() {
    setMessage("Creating order...");
    const orderPayload = {
      intent: "CAPTURE",
      processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
      purchase_units: [
        {
          amount: {
            currency_code: currencyCode,
            value: "10"
          },
        }
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

function validateExpiryDate() {
  const expiryDate = document.querySelector("#expiry-date").value.trim();
  if (!expiryDate) {
    const errorMessage = 'Expiry date is required';
    setMessage(errorMessage);
    throw new Error(errorMessage);
  }
  return { expiryDate };
}

function oxxoCheckoutSessionOptionsPromiseFactory(createOrder) {
  return async function oxxoCheckoutSessionOptionsPromise(expiryData) {
    const orderResult = await createOrder();
    const { expiryDate } = expiryData;
    return {
      orderId: orderResult.orderId,
      expiryDate: expiryDate
    };
  };
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
    defaultCountryCode: "MX",
    defaultCurrencyCode: "MXN",
  });

  const sdkInstance = await window.paypal.createInstance({
    ...auth,
    components: ["oxxo-payments"],
    testBuyerCountry: countryCode,
  });

  initializeLocale({
    sdkInstance,
    setMessage,
  });

  const paymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: currencyCode,
  });

  const isOxxoEligible = paymentMethods.isEligible("oxxo");

  if (isOxxoEligible) {
    const createOrder = buildCreateOrderFunction(currencyCode);
    const oxxoCheckoutSessionOptionsPromise = oxxoCheckoutSessionOptionsPromiseFactory(createOrder);
    const oxxoCheckout = sdkInstance.createOxxoOneTimePaymentSession({
      onApprove,
      onCancel,
      onError
    });
    const fullnameField = oxxoCheckout.createPaymentFields({
      type: "name",
      value: fullnameValue,
    });
    document.querySelector("#oxxo-full-name").appendChild(fullnameField);
    const emailField = oxxoCheckout.createPaymentFields({
      type: "email",
      value: emailValue,
    });
    document.querySelector("#oxxo-email").appendChild(emailField);
    const oxxoButton = document.querySelector("#oxxo-button");
    oxxoButton.removeAttribute("hidden");
    document.querySelector("#custom-fields").removeAttribute("hidden");
    async function onClick() {
      try {
        const expiryData = validateExpiryDate();
        const valid = await oxxoCheckout.validate();
        if(valid) {
          await oxxoCheckout.start(
            { presentationMode: "popup" },
            oxxoCheckoutSessionOptionsPromise(expiryData)
          );
        } else {
          setMessage("validation failed");
        }
      } catch (e) {
        console.error(e);
        setMessage(e.message || "Validation failed");
      }
    }
    oxxoButton.addEventListener("click", onClick);
  }
})();
