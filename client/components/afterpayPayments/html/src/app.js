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
const { auth, clientName } = await initAuth("AFTERPAY");
setMessage("Auth ready: " + (auth.clientId ? "clientId" : "clientToken"));

function buildCreateOrderFunction(currencyCode) {
  return async function createOrder() {
    setMessage("Creating order...");
    const orderPayload = {
      intent: "CAPTURE",
      processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
      purchase_units: [
        {
          reference_id: "default",
          amount: {
            breakdown: {
              item_total: {
                currency_code: currencyCode,
                value: "24.10"
              },
              tax_total: {
                currency_code: currencyCode,
                value: "2.00"
              }
            },
            currency_code: currencyCode,
            value: "26.10"
          },
          invoice_id: "Invoice-12345",
          payee: {
            merchant_id: "M683SLY6MTM78",
          },
          items: [
            {
              name: "Shirt",
              quantity: "1",
              unit_amount: {
                currency_code: currencyCode,
                value: "12.05"
              },
              tax: {
                currency_code: currencyCode,
                value: "1.00"
              }
            },
            {
              name: "Trouser",
              quantity: "1",
              unit_amount: {
                currency_code: currencyCode,
                value: "12.05"
              },
              tax: {
                currency_code: currencyCode,
                value: "1.00"
              }
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

function validateBillingAddress() {
  const addressLine1 = document.querySelector("#address-line-1").value.trim();
  const adminArea1 = document.querySelector("#admin-area-1").value.trim();
  const postalCode = document.querySelector("#postal-code").value.trim();
  const countryCode = document.querySelector("#country-code").value.trim();
  const errors = [];
  if (!addressLine1) errors.push('Address Line 1');
  if (!adminArea1) errors.push('Admin Area 1');
  if (!postalCode) errors.push('Postal Code');
  if (!countryCode) errors.push('Country Code');
  if (errors.length > 0) {
    const errorMessage = `The following fields are required: ${errors.join(', ')}`;
    setMessage(errorMessage);
    throw new Error(errorMessage);
  }
  return {
    addressLine1,
    adminArea1,
    postalCode,
    countryCode
  };
}

function afterpayCheckoutSessionOptionsPromiseFactory(createOrder) {
  return async function afterpayCheckoutSessionOptionsPromise(billingData) {
    const orderResult = await createOrder();
    const { addressLine1, adminArea1, postalCode, countryCode } = billingData;
    return {
      orderId: orderResult.orderId,
      billingAddress: {
        addressLine1,
        adminArea1,
        postalCode,
        countryCode
      }
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
    defaultCountryCode: "US",
    defaultCurrencyCode: "USD",
  });

  const sdkInstance = await window.paypal.createInstance({
    ...auth,
    components: ["afterpay-payments"],
    testBuyerCountry: countryCode,
  });

  const paymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: currencyCode,
  });

  const isAfterpayEligible = paymentMethods.isEligible("afterpay");

  if (isAfterpayEligible) {
    const createOrder = buildCreateOrderFunction(currencyCode);
    const afterpayCheckout = sdkInstance.createAfterpayOneTimePaymentSession({
      onApprove,
      onCancel,
      onError
    });
    const fullnameField = afterpayCheckout.createPaymentFields({
      type: "name",
      value: fullnameValue,
    });
    document.querySelector("#afterpay-full-name").appendChild(fullnameField);
    const emailField = afterpayCheckout.createPaymentFields({
      type: "email",
      value: emailValue,
    });
    document.querySelector("#afterpay-email").appendChild(emailField);
    const afterpayButton = document.querySelector("#afterpay-button");
    afterpayButton.removeAttribute("hidden");
    document.querySelector("#custom-fields").removeAttribute("hidden");
    async function onClick() {
      try {
        const billingData = validateBillingAddress();
        const valid = await afterpayCheckout.validate();
        if(valid) {
          await afterpayCheckout.start(
            { presentationMode: "popup" },
            afterpayCheckoutSessionOptionsPromiseFactory(createOrder)(billingData)
          );
        } else {
          setMessage("validation failed");
        }
      } catch (e) {
        console.error(e);
        setMessage(e.message || "Validation failed");
      }
    }
    afterpayButton.addEventListener("click", onClick);
  }

  document.querySelector("#update-locale").addEventListener("change", async (event) => {
    const newLocale = event.target.value;
    sdkInstance.updateLocale(newLocale);
    setMessage(`Locale updated to ${newLocale}`);
  });
})();
