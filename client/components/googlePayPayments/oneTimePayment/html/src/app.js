/**
 * Initializes the PayPal Web SDK, creates a Google Pay Payments instance,
 * and sets up the Google Pay button.
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["googlepay-payments"],
      pageType: "checkout",
    });

    setupGooglePayButton(sdkInstance);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Generates the PayPal order payload for a given purchase amount.
 * @function
 * @param {string} purchaseAmount - The total purchase amount.
 * @returns {Object} The PayPal order payload.
 */
function getPayPalOrderPayload(purchaseAmount) {
  return {
    intent: "CAPTURE",
    purchaseUnits: [
      {
        amount: {
          currencyCode: "USD",
          value: purchaseAmount,
          breakdown: {
            itemTotal: {
              currencyCode: "USD",
              value: purchaseAmount,
            },
          },
        },
      },
    ],
    paymentSource: {
      googlePay: {
        attributes: {
          verification: {
            method: "SCA_WHEN_REQUIRED",
          },
        },
      },
    },
  };
}

/**
 * Generates the Google Pay transaction info object.
 * @function
 * @param {string} purchaseAmount - The total purchase amount.
 * @param {string} countryCode - The country code (e.g., "US").
 * @returns {Object} The Google Pay transaction info.
 */
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

/**
 * Builds the Google PaymentDataRequest object for Google Pay API.
 * @async
 * @function
 * @param {string} purchaseAmount - The total purchase amount.
 * @param {Object} googlePayConfig - The Google Pay configuration object.
 * @returns {Promise<Object>} The PaymentDataRequest object.
 */
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

/**
 * Handles the payment authorization callback from Google Pay.
 * Creates and confirms the PayPal order, and captures it if possible.
 * @async
 * @function
 * @param {string} purchaseAmount - The total purchase amount.
 * @param {Object} paymentData - The payment data from Google Pay.
 * @param {Object} googlePaySession - The Google Pay session instance.
 * @returns {Promise<Object>} The transaction state result.
 */
async function onPaymentAuthorized(
  purchaseAmount,
  paymentData,
  googlePaySession,
) {
  try {
    const orderPayload = getPayPalOrderPayload(purchaseAmount);
    const id = await createOrder(orderPayload);

    const { status } = await googlePaySession.confirmOrder({
      orderId: id,
      paymentMethodData: paymentData.paymentMethodData,
    });

    if (status !== "PAYER_ACTION_REQUIRED") {
      const orderData = await captureOrder({ orderId: id });
      console.log(JSON.stringify(orderData, null, 2));
    }

    return { transactionState: "SUCCESS" };
  } catch (err) {
    console.error("Payment authorization error:", err);
    return {
      transactionState: "ERROR",
      error: {
        message: err.message,
      },
    };
  }
}

/**
 * Handles the Google Pay button click event.
 * Loads the payment data request using the PaymentsClient.
 * @async
 * @function
 * @param {string} purchaseAmount - The total purchase amount.
 * @param {Object} paymentsClient - The Google PaymentsClient instance.
 * @param {Object} googlePayConfig - The Google Pay configuration object.
 * @returns {Promise<void>}
 */
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

    paymentsClient.loadPaymentData(paymentDataRequest);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Sets up the Google Pay button and session, and appends the button to the DOM if ready.
 * @async
 * @function
 * @param {Object} sdkInstance - The PayPal SDK instance.
 * @returns {Promise<void>}
 */
async function setupGooglePayButton(sdkInstance) {
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

    const googlePayConfig = await googlePaySession.getGooglePayConfig();

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
  }
}

/**
 * Fetches a browser-safe client token from the server for PayPal SDK initialization.
 * @async
 * @function
 * @returns {Promise<string>} The browser-safe client access token.
 */
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

/**
 * Creates a PayPal order by sending the order payload to the server.
 * @async
 * @function
 * @param {Object} orderPayload - The PayPal order payload.
 * @returns {Promise<string>} The created order ID.
 */
async function createOrder(orderPayload) {
  const response = await fetch("/paypal-api/checkout/orders/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderPayload),
  });
  const { id } = await response.json();

  return id;
}

/**
 * Captures a PayPal order by order ID.
 * @async
 * @function
 * @param {Object} params - The parameters object.
 * @param {string} params.orderId - The PayPal order ID.
 * @returns {Promise<Object>} The capture order response data.
 */
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
