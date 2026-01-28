async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["applepay-payments"],
      pageType: "checkout",
    });

    const isApplePaySDKAvailable =
      window.ApplePaySession && ApplePaySession.canMakePayments();

    if (!isApplePaySDKAvailable) {
      return renderAlert({
        type: "warning",
        message: "ApplePay SDK is not available",
      });
    }

    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "USD",
    });

    if (paymentMethods.isEligible("applepay")) {
      const applePayPaymentMethodDetails =
        paymentMethods.getDetails("applepay");
      setupApplePayButton(sdkInstance, applePayPaymentMethodDetails);
    } else {
      renderAlert({ type: "warning", message: "ApplePay is not eligible" });
    }
  } catch (error) {
    console.error(error);
  }
}

async function setupApplePayButton(sdkInstance, applePayPaymentMethodDetails) {
  try {
    const paypalSdkApplePayPaymentSession =
      sdkInstance.createApplePayOneTimePaymentSession();

    document.getElementById("apple-pay-button-container").innerHTML =
      '<apple-pay-button id="apple-pay-button" buttonstyle="black" type="buy" locale="en">';
    document
      .getElementById("apple-pay-button")
      .addEventListener("click", onClick);

    async function onClick() {
      const paymentRequest = {
        ...paypalSdkApplePayPaymentSession.formatConfigForPaymentRequest(
          applePayPaymentMethodDetails.config,
        ),
        countryCode: "US",
        currencyCode: "USD",
        requiredBillingContactFields: [
          "name",
          "phone",
          "email",
          "postalAddress",
        ],
        requiredShippingContactFields: [],
        total: {
          label: "Demo (Card is not charged)",
          amount: "100.00",
          type: "final",
        },
      };

      console.log("Creating Apple Pay SDK session...");
      let appleSdkApplePayPaymentSession = new ApplePaySession(
        4,
        paymentRequest,
      );

      appleSdkApplePayPaymentSession.onvalidatemerchant = (event) => {
        console.log("Validating Apple Pay merchant & domain...");
        paypalSdkApplePayPaymentSession
          .validateMerchant({
            validationUrl: event.validationURL,
          })
          .then((payload) => {
            appleSdkApplePayPaymentSession.completeMerchantValidation(
              payload.merchantSession,
            );
            console.log("Completed merchant validation");
          })
          .catch((err) => {
            console.error("PayPal validatemerchant error", err);
            renderAlert({
              type: "danger",
              message: "PayPal merchant validation failed",
            });

            appleSdkApplePayPaymentSession.abort();
          });
      };

      appleSdkApplePayPaymentSession.onpaymentmethodselected = () => {
        appleSdkApplePayPaymentSession.completePaymentMethodSelection({
          newTotal: paymentRequest.total,
        });
        console.log("Completed payment method selection");
      };

      appleSdkApplePayPaymentSession.onpaymentauthorized = async (event) => {
        try {
          console.log("Apple Pay authorized... \nCreating PayPal order...");
          const createdOrder = await createOrder();
          console.log(
            "Confirming PayPal order with applepay payment source...",
          );

          await paypalSdkApplePayPaymentSession.confirmOrder({
            orderId: createdOrder.orderId,
            token: event.payment.token,
            billingContact: event.payment.billingContact,
            shippingContact: event.payment.shippingContact,
          });

          console.log(
            `Capturing order ${JSON.stringify(createdOrder, null, 2)}...`,
          );
          const orderData = await captureOrder({
            orderId: createdOrder.orderId,
            fundingSource: "applepay",
          });
          console.log(JSON.stringify(orderData, null, 2));
          console.log("Completed Apple Pay SDK session with STATUS_SUCCESS...");
          appleSdkApplePayPaymentSession.completePayment({
            status: window.ApplePaySession.STATUS_SUCCESS,
          });
          renderAlert({
            type: "success",
            message: "Completed Apple Pay SDK session with STATUS_SUCCESS",
          });
        } catch (err) {
          console.error(err);
          appleSdkApplePayPaymentSession.completePayment({
            status: window.ApplePaySession.STATUS_FAILURE,
          });
        }
      };

      appleSdkApplePayPaymentSession.oncancel = () => {
        console.log("Apple Pay Canceled!");
      };

      appleSdkApplePayPaymentSession.begin();
    }
  } catch (error) {
    console.error(error);
  }
}

async function getBrowserSafeClientToken() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { accessToken } = await response.json();

  return accessToken;
}

async function createOrder() {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-one-time-payment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const { id } = await response.json();
  renderAlert({ type: "info", message: `Order successfully created: ${id}` });

  return { orderId: id };
}

async function captureOrder({ orderId }) {
  const response = await fetch(
    `/paypal-api/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.json();

  return data;
}

function renderAlert({ type, message }) {
  const alertComponentElement = document.querySelector("alert-component");
  if (!alertComponentElement) {
    return;
  }

  alertComponentElement.setAttribute("type", type);
  alertComponentElement.innerText = message;
}
