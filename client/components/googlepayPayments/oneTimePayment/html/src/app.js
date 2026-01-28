async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["googlepay-payments"],
      pageType: "checkout",
    });

    const isGooglePaySDKAvailable =
      window.google && google.payments.api.PaymentsClient;

    if (!isGooglePaySDKAvailable) {
      return renderAlert({
        type: "warning",
        message: "GooglePay SDK is not available",
      });
    }

    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "USD",
    });

    if (paymentMethods.isEligible("googlepay")) {
      const googlePayPaymentMethodDetails =
        paymentMethods.getDetails("googlepay");
      setupGooglePayButton(sdkInstance, googlePayPaymentMethodDetails);
    } else {
      renderAlert({ type: "warning", message: "GooglePay is not eligible" });
    }
  } catch (error) {
    console.error(error);
  }
}

function getGoogleTransactionInfo(purchaseAmount, countryCode) {
  const totalAmount = parseFloat(purchaseAmount);
  const subtotal = (totalAmount * 0.9).toFixed(2);
  const tax = (totalAmount * 0.1).toFixed(2);

  return {
    displayItems: [
      {
        label: "Subtotal",
        type: "SUBTOTAL",
        price: subtotal,
      },
      {
        label: "Tax",
        type: "TAX",
        price: tax,
      },
    ],
    countryCode: countryCode,
    currencyCode: "USD",
    totalPriceStatus: "FINAL",
    totalPrice: purchaseAmount,
    totalPriceLabel: "Total",
  };
}

async function getGooglePaymentDataRequest(purchaseAmount, googlePayConfig) {
  const {
    allowedPaymentMethods,
    merchantInfo,
    apiVersion,
    apiVersionMinor,
    countryCode,
  } = googlePayConfig;

  const baseRequest = {
    apiVersion,
    apiVersionMinor,
  };
  const paymentDataRequest = Object.assign({}, baseRequest);

  paymentDataRequest.allowedPaymentMethods = allowedPaymentMethods;
  paymentDataRequest.transactionInfo = getGoogleTransactionInfo(
    purchaseAmount,
    countryCode,
  );

  paymentDataRequest.merchantInfo = merchantInfo;
  paymentDataRequest.callbackIntents = ["PAYMENT_AUTHORIZATION"];

  return paymentDataRequest;
}

async function onPaymentAuthorized(
  purchaseAmount,
  paymentData,
  googlePaySession,
) {
  try {
    const id = await createOrder();

    const { status } = await googlePaySession.confirmOrder({
      orderId: id,
      paymentMethodData: paymentData.paymentMethodData,
    });

    if (status !== "PAYER_ACTION_REQUIRED") {
      const orderData = await captureOrder({ orderId: id });
      console.log(JSON.stringify(orderData, null, 2));
    }

    renderAlert({
      type: "success",
      message: "Completed order with GooglePay",
    });

    return { transactionState: "SUCCESS" };
  } catch (err) {
    console.error("Payment authorization error:", err);
    renderAlert({
      type: "danger",
      message: "Payment authorization error",
    });

    return {
      transactionState: "ERROR",
      error: {
        message: err.message,
      },
    };
  }
}

async function onGooglePayButtonClick(
  purchaseAmount,
  paymentsClient,
  googlePayConfig,
) {
  try {
    const paymentDataRequest = await getGooglePaymentDataRequest(
      purchaseAmount,
      googlePayConfig,
    );

    await paymentsClient.loadPaymentData(paymentDataRequest);
  } catch (error) {
    console.error(error);
    renderAlert({
      type: "danger",
      message: "GooglePay failed to load payment data",
    });
  }
}

async function setupGooglePayButton(
  sdkInstance,
  googlePayPaymentMethodDetails,
) {
  const googlePaySession = sdkInstance.createGooglePayOneTimePaymentSession();
  const purchaseAmount = "10.00";

  try {
    const paymentsClient = new google.payments.api.PaymentsClient({
      environment: "TEST", // Change to "PRODUCTION" for live transactions
      paymentDataCallbacks: {
        onPaymentAuthorized: (paymentData) =>
          onPaymentAuthorized(purchaseAmount, paymentData, googlePaySession),
      },
    });

    const googlePayConfig = googlePaySession.formatConfigForPaymentRequest(
      googlePayPaymentMethodDetails.config,
    );

    const isReadyToPay = await paymentsClient.isReadyToPay({
      allowedPaymentMethods: googlePayConfig.allowedPaymentMethods,
      apiVersion: googlePayConfig.apiVersion,
      apiVersionMinor: googlePayConfig.apiVersionMinor,
    });

    if (isReadyToPay.result) {
      const button = paymentsClient.createButton({
        onClick: () =>
          onGooglePayButtonClick(
            purchaseAmount,
            paymentsClient,
            googlePayConfig,
          ),
      });

      document.getElementById("googlepay-button-container").appendChild(button);
    }
  } catch (error) {
    console.error("Setup error:", error);
    renderAlert({ type: "danger", message: "GooglePay setup error" });
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

  return id;
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
