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

function boletoCheckoutSessionOptionsPromiseFactory(createOrder) {
  return async function boletoCheckoutSessionOptionsPromise(billingData) {
    const { orderId } = await createOrder();
    const {
      addressLine1,
      addressLine2,
      adminArea1,
      adminArea2,
      postalCode,
      countryCode,
      taxId,
      taxIdType,
      expiryDate
    } = billingData;
    return {
      orderId,
      billingAddress: {
        addressLine1,
        addressLine2,
        adminArea2,
        adminArea1,
        postalCode,
        countryCode
      },
      taxInfo: {
        taxId,
        taxIdType,
      },
      expiryDate
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
    defaultCountryCode: "BR",
    defaultCurrencyCode: "BRL",
  });
  const sdkInstance = await window.paypal.createInstance({
    ...auth,
    components: ["boletobancario-payments"],
    testBuyerCountry: countryCode,
  });
  initializeLocale({
    sdkInstance,
    setMessage,
  });
  const paymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: currencyCode,
  });
  const isBoletobancarioEligible = paymentMethods.isEligible("boletobancario");
  if (isBoletobancarioEligible) {
    const createOrder = buildCreateOrderFunction(currencyCode);
    const boletoCheckoutSessionOptionsPromise = boletoCheckoutSessionOptionsPromiseFactory(createOrder);
    const boletobancarioCheckout = sdkInstance.createBoletobancarioOneTimePaymentSession({
      onApprove,
      onCancel,
      onError
    });
    const fullnameField = boletobancarioCheckout.createPaymentFields({
      type: "name",
      value: fullnameValue,
    });
    document.querySelector("#boletobancario-full-name").appendChild(fullnameField);
    const emailField = boletobancarioCheckout.createPaymentFields({
      type: "email",
      value: emailValue,
    });
    document.querySelector("#boletobancario-email").appendChild(emailField);
    const boletobancarioButton = document.querySelector("#boletobancario-button");
    boletobancarioButton.removeAttribute("hidden");
    document.querySelector("#custom-fields").removeAttribute("hidden");
    async function onClick() {
      try {
        const billingData = validateBillingAddress();
        const valid = await boletobancarioCheckout.validate();
        if(valid) {
          await boletobancarioCheckout.start(
            { presentationMode: "popup" },
            boletoCheckoutSessionOptionsPromise(billingData)
          );
        } else {
          setMessage("validation failed");
        }
      } catch (e) {
        console.error(e);
        setMessage(e.message || "Validation failed");
      }
    }
    function validateBillingAddress() {
      const addressLine1 = document.querySelector("#address-line-1").value.trim();
      const addressLine2 = document.querySelector("#address-line-2").value.trim();
      const adminArea1 = document.querySelector("#admin-area-1").value.trim();
      const adminArea2 = document.querySelector("#admin-area-2").value.trim();
      const postalCode = document.querySelector("#postal-code").value.trim();
      const countryCode = document.querySelector("#country-code").value.trim();
      const taxId = document.querySelector("#tax-id").value.trim();
      const taxIdType = document.querySelector("#tax-id-type").value.trim();
      const expiryDate = document.querySelector("#expiry-date").value.trim();
      const errors = [];
      if (!addressLine1) errors.push("Address Line 1");
      if (!addressLine2) errors.push("Address Line 2");
      if (!adminArea1) errors.push("Admin Area 1");
      if (!adminArea2) errors.push("Admin Area 2");
      if (!postalCode) errors.push("Postal Code");
      if (!countryCode) errors.push("Country Code");
      if (!taxId) errors.push("Tax ID");
      if (!taxIdType) errors.push("Tax ID Type");
      if (!expiryDate) errors.push("Expiry Date");
      if (errors.length > 0) {
        const errorMessage = `The following fields are required: ${errors.join(', ')}`;
        setMessage(errorMessage);
        throw new Error(errorMessage);
      }
      return {
        addressLine1,
        addressLine2,
        adminArea1,
        adminArea2,
        postalCode,
        countryCode,
        taxId,
        taxIdType,
        expiryDate
      };
    }
    boletobancarioButton.addEventListener("click", onClick);
  }
})();
