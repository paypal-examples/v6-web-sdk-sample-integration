async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["applepay-payments"],
      pageType: "checkout",
    });

    setupApplePayButton(sdkInstance);
  } catch (error) {
    console.error(error);
  }
}

async function setupApplePayButton(sdkInstance) {
  try {
    const paypalSdkApplePayPaymentSession =
      await sdkInstance.createApplePayOneTimePaymentSession();

    const { merchantCapabilities, supportedNetworks } =
      await paypalSdkApplePayPaymentSession.config();

    document.getElementById("apple-pay-button-container").innerHTML =
      '<apple-pay-button id="apple-pay-button" buttonstyle="black" type="buy" locale="en">';
    document
      .getElementById("apple-pay-button")
      .addEventListener("click", onClick);

    async function onClick() {
      const paymentRequest = {
        countryCode: "US",
        currencyCode: "USD",
        merchantCapabilities,
        supportedNetworks,
        requiredBillingContactFields: [
          "name",
          "phone",
          "email",
          "postalAddress",
        ],
        requiredShippingContactFields: [],
        total: {
          label: "Demo (Card is not charged)",
          amount: "10.00",
          type: "final",
        },
      };

      console.log("Creating Apple Pay SDK session...");
      let session = new ApplePaySession(4, paymentRequest);

      session.onvalidatemerchant = (event) => {
        console.log("Validating Apple Pay merchant & domain...");
        paypalSdkApplePayPaymentSession
          .validateMerchant({
            validationUrl: event.validationURL,
          })
          .then((payload) => {
            session.completeMerchantValidation(payload.merchantSession);
            console.log("Completed merchant validation");
          })
          .catch((err) => {
            console.log("Paypal validatemerchant error", err);
            console.error(err);
            session.abort();
          });
      };

      session.onpaymentmethodselected = () => {
        session.completePaymentMethodSelection({
          newTotal: paymentRequest.total,
        });
        console.log("Completed payment method selection");
      };

      session.onpaymentauthorized = async (event) => {
        try {
          console.log("Apple Pay authorized... \nCreating PayPal order...");
          const createdOrder = await createOrder();
          console.log(
            "Confirming PayPal order with applepay payment source...",
          );

          await paypalSdkApplePayPaymentSession.confirmOrder({
            orderId: createdOrder,
            token: event.payment.token,
            billingContact: event.payment.billingContact,
            shippingContact: event.payment.shippingContact,
          });

          console.log(`Capturing order ${createdOrder}...`);
          const orderData = await captureOrder({
            orderId: createdOrder,
            fundingSource: "applepay",
            headers: { "X-CSRF-TOKEN": "<%= csrfToken %>" },
          });
          console.log(JSON.stringify(orderData, null, 2));
          console.log("Completed Apple Pay SDK session with STATUS_SUCCESS...");
          session.completePayment({
            status: window.ApplePaySession.STATUS_SUCCESS,
          });
        } catch (err) {
          console.error(err);
          session.completePayment({
            status: window.ApplePaySession.STATUS_FAILURE,
          });
        }
      };

      session.oncancel = () => {
        console.log("Apple Pay Canceled!");
      };

      session.begin();
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
    "/paypal-api/checkout/orders/create-with-sample-data",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const { id } = await response.json();

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
