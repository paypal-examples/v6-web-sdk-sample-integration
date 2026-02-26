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
      intent: "AUTHORIZE",
      processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
      purchase_units: [
        {
          payee: { merchant_id: "U83XRVL67BW2J" },
          amount: {
            currency_code: currencyCode,
            value: 30,
            breakdown: {
              item_total: { currency_code: currencyCode, value: 30 },
              shipping: { currency_code: currencyCode, value: "0.00" },
              handling: { currency_code: currencyCode, value: "0.00" },
              tax_total: { currency_code: currencyCode, value: "0.00" },
              shipping_discount: { currency_code: currencyCode, value: "0.00" }
            }
          },
          items: [
            {
              name: "jersey",
              description: "jersey",
              sku: "",
              unit_amount: { currency_code: currencyCode, value: "15.00" },
              tax: { currency_code: currencyCode, value: "0.00" },
              category: "PHYSICAL_GOODS",
              quantity: "1"
            },
            {
              name: "jersey",
              description: "jersey",
              sku: "",
              unit_amount: { currency_code: currencyCode, value: "15.00" },
              tax: { currency_code: currencyCode, value: "0.00" },
              category: "PHYSICAL_GOODS",
              quantity: "1"
            }
          ]
        }
      ]
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

function klarnaCheckoutSessionOptionsPromiseFactory(createOrder) {
  return async function klarnaCheckoutSessionOptionsPromise(billingData) {
    const orderId = await createOrder();
    const {
      addressLine1,
      adminArea1,
      adminArea2,
      postalCode,
      countryCode,
      phoneCountryCode,
      phoneNationalNumber
    } = billingData;
    return {
      orderId,
      billingAddress: {
        addressLine1,
        adminArea2,
        adminArea1,
        postalCode,
        countryCode
      },
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
  let fullName;
  let email;

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
    defaultCountryCode: "GB",
    defaultCurrencyCode: "GBP",
  });

  const sdkInstance = await window.paypal.createInstance({
    ...auth,
    components: ["klarna-payments"],
    testBuyerCountry: countryCode,
  });

  const paymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: currencyCode,
  });

  const isKlarnaEligible = paymentMethods.isEligible("klarna");

  if (isKlarnaEligible) {
    const createOrder = buildCreateOrderFunction(currencyCode);
    const klarnaCheckoutSessionOptionsPromise = klarnaCheckoutSessionOptionsPromiseFactory(createOrder);
    const klarnaCheckout = sdkInstance.createKlarnaOneTimePaymentSession({
      onApprove,
      onCancel,
      onError
    });

    const fullNameField = klarnaCheckout.createPaymentFields({
      type: "name",
      value: fullName,
    });
    document.querySelector("#klarna-full-name").appendChild(fullNameField);

    const emailField = klarnaCheckout.createPaymentFields({
      type: "email",
      value: email,
    });
    document.querySelector("#klarna-email").appendChild(emailField);

    function validateBillingAddress() {
      const addressLine1 = document.querySelector("#address-line-1").value.trim();
      const adminArea1 = document.querySelector("#admin-area-1").value.trim();
      const adminArea2 = document.querySelector("#admin-area-2").value.trim();
      const postalCode = document.querySelector("#postal-code").value.trim();
      const countryCode = document.querySelector("#country-code").value.trim();
      const phoneCountryCode = document.querySelector("#phone-country-code").value.trim();
      const phoneNationalNumber = document.querySelector("#phone-national-number").value.trim();
      const errors = [];
      if (!addressLine1) errors.push("Address Line 1");
      if (!adminArea1) errors.push("Admin Area 1");
      if (!adminArea2) errors.push("Admin Area 2");
      if (!postalCode) errors.push("Postal Code");
      if (!countryCode) errors.push("Country Code");
      if (!phoneCountryCode) errors.push("Phone Country Code");
      if (!phoneNationalNumber) errors.push("Phone National Number");
      if (errors.length > 0) {
        const errorMessage = `The following fields are required: ${errors.join(", ")}`;
        setMessage(errorMessage);
        throw new Error(errorMessage);
      }
      return {
        addressLine1,
        adminArea1,
        adminArea2,
        postalCode,
        countryCode,
        phoneCountryCode,
        phoneNationalNumber
      };
    }

    async function onClick() {
      try {
        const billingData = validateBillingAddress();
        const valid = await klarnaCheckout.validate();
        if(valid) {
          await klarnaCheckout.start(
            { presentationMode: "popup" },
            klarnaCheckoutSessionOptionsPromise(billingData)
          );
        } else {
          setMessage("validation failed");
        }
      } catch (e) {
        console.error(e);
        setMessage(e.message || "Validation failed");
      }
    }

    const klarnaButton = document.querySelector("#klarna-button");
    klarnaButton.removeAttribute("hidden");
    klarnaButton.addEventListener("click", onClick);
    document.querySelector("#custom-fields").removeAttribute("hidden");
  }

  document.querySelector("#update-locale").addEventListener("change", async (event) => {
    const newLocale = event.target.value;
    sdkInstance.updateLocale(newLocale);
    setMessage(`Locale updated to ${newLocale}`);
  });
})();
