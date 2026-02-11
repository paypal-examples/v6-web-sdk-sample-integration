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
const { auth, clientName } = await initAuth("DRAGONPAY");
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
          value: 100
        }
      }]
    };
    const { id: orderId } = await createOrderHelper({
      headers: { "X-CSRF-TOKEN": "" },
      body: orderPayload,
      clientName,
    });
    setMessage(`Order ${orderId}`);
    return orderId;
  };
}

function dragonpayCheckoutSessionOptionsPromiseFactory(createOrder) {
  return async function dragonpayCheckoutSessionOptionsPromise(phoneData) {
    const orderId = await createOrder();
    const {
      phoneCountryCode,
      phoneNationalNumber
    } = phoneData;
    return {
      orderId,
      phone: {
        nationalNumber: phoneNationalNumber,
        countryCode: phoneCountryCode,
      },
    };
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
    defaultCountryCode: "PH",
    defaultCurrencyCode: "PHP",
  });
  const sdkInstance = await window.paypal.createInstance({
    ...auth,
    components: ["dragonpay-payments"],
    testBuyerCountry: countryCode,
  });
  initializeLocale({
    sdkInstance,
    setMessage,
  });
  const paymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: currencyCode,
  });
  const isDragonpayEligible = paymentMethods.isEligible("dragonpay");
  if (isDragonpayEligible) {
    const createOrder = buildCreateOrderFunction(currencyCode);
    const dragonpayCheckoutSessionOptionsPromise = dragonpayCheckoutSessionOptionsPromiseFactory(createOrder);
    const dragonpayCheckout = sdkInstance.createDragonpayOneTimePaymentSession({
      onApprove,
      onCancel,
      onError
    });
    const fullnameField = dragonpayCheckout.createPaymentFields({
      type: "name",
      value: fullnameValue,
    });
    document.querySelector("#dragonpay-full-name").appendChild(fullnameField);
    const emailField = dragonpayCheckout.createPaymentFields({
      type: "email",
      value: emailValue,
    });
    document.querySelector("#dragonpay-email").appendChild(emailField);
    const dragonpayButton = document.querySelector("#dragonpay-button");
    dragonpayButton.removeAttribute("hidden");
    document.querySelector("#phone-fields").removeAttribute("hidden");
    async function onClick() {
      try {
        const phoneData = validatePhoneNumber();
        const valid = await dragonpayCheckout.validate();
        if(valid) {
          await dragonpayCheckout.start(
            { presentationMode: "popup" },
            dragonpayCheckoutSessionOptionsPromise(phoneData)
          );
        } else {
          setMessage("validation failed");
        }
      } catch (e) {
        console.error(e);
        setMessage(e.message || "Validation failed");
      }
    }
    function validatePhoneNumber() {
      const phoneCountryCode = document.querySelector("#phone-country-code").value.trim();
      const phoneNationalNumber = document.querySelector("#phone-national-number").value.trim();
      const errors = [];
      if (!phoneCountryCode) errors.push("Phone Country Code");
      if (!phoneNationalNumber) errors.push("Phone National Number");
      if (errors.length > 0) {
        const errorMessage = `The following fields are required: ${errors.join(', ')}`;
        setMessage(errorMessage);
        throw new Error(errorMessage);
      }
      return {
        phoneCountryCode,
        phoneNationalNumber
      };
    }
    dragonpayButton.addEventListener("click", onClick);
  }
})();
