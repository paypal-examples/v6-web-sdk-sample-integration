async function onPayPalWebSdkLoaded() {
  try {
    const clientId = await getBrowserSafeClientId();
    const sdkInstance = await window.paypal.createInstance({
      clientId,
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
      paymentFlow: "VAULT_WITH_PAYMENT",
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

    const applePayButton = createApplePayButton();
    applePayButton.addEventListener("click", onClick);
    document
      .getElementById("apple-pay-button-container")
      .appendChild(applePayButton);

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
          // amount passed to ApplePay must match amount passed into the PayPal Order on the server-side
          amount: "20.00",
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
          });
          console.log(JSON.stringify(orderData, null, 2));
          const captureStatus =
            orderData.purchase_units[0].payments.captures[0].status;
          if (captureStatus === "COMPLETED" || captureStatus === "PENDING") {
            console.log(
              "Completed Apple Pay SDK session with STATUS_SUCCESS...",
            );
            appleSdkApplePayPaymentSession.completePayment({
              status: window.ApplePaySession.STATUS_SUCCESS,
            });
            renderAlert({
              type: "success",
              message: "Completed Apple Pay SDK session with STATUS_SUCCESS",
            });
          } else {
            appleSdkApplePayPaymentSession.completePayment({
              status: window.ApplePaySession.STATUS_FAILURE,
            });
          }
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

function createApplePayButton() {
  const applePayButton = document.createElement("apple-pay-button");
  applePayButton.id = "apple-pay-button";
  applePayButton.setAttribute("buttonstyle", "black");
  applePayButton.setAttribute("type", "buy");
  applePayButton.setAttribute("locale", "en-US");

  applePayButton.style.setProperty("--apple-pay-button-width", "150px");
  applePayButton.style.setProperty("--apple-pay-button-height", "40px");
  applePayButton.style.setProperty("--apple-pay-button-border-radius", "5px");

  return applePayButton;
}

async function getBrowserSafeClientId() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-id", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { clientId } = await response.json();

  return clientId;
}

async function createOrder() {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-apple-pay-one-time-payment-with-vault",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cart: [
          {
            // $20 amount (2 baseballs at $10 each)
            sku: "3xk9m4n2",
            quantity: 2,
          },
        ],
        currencyCode: "USD",
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to create order: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`,
    );
  }

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

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to capture order ${orderId}: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`,
    );
  }

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
