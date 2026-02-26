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
const { auth, clientName } = await initAuth("ZIP");
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
            breakdown: {
              item_total: {
                currency_code: currencyCode,
                value: "34.10"
              },
              tax_total: {
                currency_code: currencyCode,
                value: "2.00"
              }
            },
            currency_code: currencyCode,
            value: "36.10"
          },
          payee: {
            merchant_id: "M683SLY6MTM78"
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
                value: "22.05"
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
  const adminArea2 = document.querySelector("#admin-area-2").value.trim();
  const postalCode = document.querySelector("#postal-code").value.trim();
  const countryCode = document.querySelector("#country-code").value.trim();
  const phoneCountryCode = document.querySelector("#phone-country-code").value.trim();
  const phoneNationalNumber = document.querySelector("#phone-national-number").value.trim();
  const errors = [];
  if (!addressLine1) errors.push('Address Line 1');
  if (!adminArea1) errors.push('Admin Area 1');
  if (!adminArea2) errors.push('Admin Area 2');
  if (!postalCode) errors.push('Postal Code');
  if (!countryCode) errors.push('Country Code');
  if (!phoneCountryCode) errors.push('Phone Country Code');
  if (!phoneNationalNumber) errors.push('Phone National Number');
  if (errors.length > 0) {
    const errorMessage = `The following fields are required: ${errors.join(', ')}`;
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

function zipCheckoutSessionOptionsPromiseFactory(createOrder) {
  return async function zipCheckoutSessionOptionsPromise(billingData) {
    const orderResult = await createOrder();
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
      orderId: orderResult.orderId,
      billingAddress: {
        addressLine1,
        adminArea1,
        adminArea2,
        postalCode,
        countryCode
      },
      phone: {
        countryCode: phoneCountryCode,
        nationalNumber: phoneNationalNumber,
      },
    };
  };
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
    defaultCountryCode: "US",
    defaultCurrencyCode: "USD",
  });
  const sdkInstance = await window.paypal.createInstance({
    ...auth,
    components: ["zip-payments"],
    testBuyerCountry: countryCode,
  });
  const paymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: currencyCode,
  });
  const isZipEligible = paymentMethods.isEligible("zip");
  if (isZipEligible) {
    const createOrder = createOrderFactory(currencyCode);
    const zipCheckout = sdkInstance.createZipOneTimePaymentSession({
      onApprove,
      onCancel,
      onError
    });
    const fullnameField = zipCheckout.createPaymentFields({
      type: "name",
      value: fullnameValue,
    });
    document.querySelector("#zip-full-name").appendChild(fullnameField);
    const zipButton = document.querySelector("#zip-button");
    zipButton.removeAttribute("hidden");
    document.querySelector("#custom-fields").removeAttribute("hidden");
    async function onClick() {
      try {
        const billingData = validateBillingAddress();
        const valid = await zipCheckout.validate();
        if(valid) {
          await zipCheckout.start(
            { presentationMode: "popup" },
            zipCheckoutSessionOptionsPromiseFactory(createOrder)(billingData)
          );
        } else {
          setMessage("validation failed");
        }
      } catch (e) {
        console.error(e);
        setMessage(e.message || "Validation failed");
      }
    }
    zipButton.addEventListener("click", onClick);
  }
  document.querySelector("#update-locale").addEventListener("change", async (event) => {
    const newLocale = event.target.value;
    sdkInstance.updateLocale(newLocale);
    setMessage(`Locale updated to ${newLocale}`);
  });
})();
