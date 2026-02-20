import {
  loadCoreSdkScript,
  type SdkInstance,
  type OnApproveDataOneTimePayments,
  type OnCancelDataOneTimePayments,
  type OnErrorData,
  type FindEligibleMethodsGetDetails,
  type PayPalOneTimePaymentSessionOptions,
} from "@paypal/paypal-js/sdk-v6";

import { createOrderApiCall, captureOrderApiCall } from "./orders";
import { renderAlert } from "./alert";

type AppSdkInstance = SdkInstance<["paypal-payments"]>;

const paypalGlobalNamespace = await loadCoreSdkScript({
  environment: "sandbox",
});

if (!paypalGlobalNamespace) {
  throw new Error("PayPal Core SDK script failed to load");
}

try {
  const clientId = await getBrowserSafeClientId();
  const sdkInstance = await paypalGlobalNamespace.createInstance({
    clientId,
    components: ["paypal-payments"],
    pageType: "checkout",
  });

  const paymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: "USD",
  });

  const paymentSessionOptions = getSharedPaymentSessionOptions();

  if (paymentMethods.isEligible("paypal")) {
    setupPayPalButton({ sdkInstance, paymentSessionOptions });
  }

  if (paymentMethods.isEligible("paylater")) {
    setupPayLaterButton({
      sdkInstance,
      paylaterPaymentMethodDetails: paymentMethods.getDetails("paylater"),
      paymentSessionOptions,
    });
  }

  if (paymentMethods.isEligible("credit")) {
    setupPayPalCreditButton({
      sdkInstance,
      creditPaymentMethodDetails: paymentMethods.getDetails("credit"),
      paymentSessionOptions,
    });
  }
} catch (error) {
  renderAlert({
    type: "danger",
    message: "Failed to initialize the PayPal Web SDK",
  });
  console.error(error);
}

function setupPayPalButton({
  sdkInstance,
  paymentSessionOptions,
}: {
  sdkInstance: AppSdkInstance;
  paymentSessionOptions: PayPalOneTimePaymentSessionOptions;
}) {
  const paypalPaymentSession = sdkInstance.createPayPalOneTimePaymentSession(
    paymentSessionOptions,
  );

  const paypalButton = document.querySelector("#paypal-button");
  paypalButton?.removeAttribute("hidden");

  paypalButton?.addEventListener("click", async () => {
    try {
      // get the promise reference by invoking createOrder()
      // do not await this async function since it can cause transient activation issues
      const createOrderPromise = createOrderApiCall();
      await paypalPaymentSession.start(
        { presentationMode: "auto" },
        createOrderPromise,
      );

      renderAlert({ type: "info", message: "Order successfully created" });
    } catch (error) {
      console.error(error);
    }
  });
}

function setupPayLaterButton({
  sdkInstance,
  paylaterPaymentMethodDetails,
  paymentSessionOptions,
}: {
  sdkInstance: AppSdkInstance;
  paylaterPaymentMethodDetails: FindEligibleMethodsGetDetails<"paylater">;
  paymentSessionOptions: PayPalOneTimePaymentSessionOptions;
}) {
  const paylaterPaymentSession =
    sdkInstance.createPayLaterOneTimePaymentSession(paymentSessionOptions);

  const { productCode, countryCode } = paylaterPaymentMethodDetails;
  const paylaterButton = document.querySelector("#paylater-button");

  if (paylaterButton && productCode && countryCode) {
    paylaterButton.setAttribute("productCode", productCode);
    paylaterButton.setAttribute("countryCode", countryCode);
    paylaterButton?.removeAttribute("hidden");

    paylaterButton?.addEventListener("click", async () => {
      try {
        // get the promise reference by invoking createOrder()
        // do not await this async function since it can cause transient activation issues
        const createOrderPromise = createOrderApiCall();
        await paylaterPaymentSession.start(
          { presentationMode: "auto" },
          createOrderPromise,
        );

        renderAlert({ type: "info", message: "Order successfully created" });
      } catch (error) {
        console.error(error);
      }
    });
  }
}

function setupPayPalCreditButton({
  sdkInstance,
  creditPaymentMethodDetails,
  paymentSessionOptions,
}: {
  sdkInstance: AppSdkInstance;
  creditPaymentMethodDetails: FindEligibleMethodsGetDetails<"credit">;
  paymentSessionOptions: PayPalOneTimePaymentSessionOptions;
}) {
  const paypalCreditPaymentSession =
    sdkInstance.createPayPalCreditOneTimePaymentSession(paymentSessionOptions);

  const { countryCode } = creditPaymentMethodDetails;
  const paypalCreditButton = document.querySelector("#paypal-credit-button");

  if (paypalCreditButton && countryCode) {
    paypalCreditButton.setAttribute("countryCode", countryCode);
    paypalCreditButton.removeAttribute("hidden");

    paypalCreditButton.addEventListener("click", async () => {
      try {
        // get the promise reference by invoking createOrder()
        // do not await this async function since it can cause transient activation issues
        const createOrderPromise = createOrderApiCall();
        await paypalCreditPaymentSession.start(
          { presentationMode: "auto" },
          createOrderPromise,
        );

        renderAlert({ type: "info", message: "Order successfully created" });
      } catch (error) {
        console.error(error);
      }
    });
  }
}

function getSharedPaymentSessionOptions() {
  return {
    commit: false,
    async onApprove(data: OnApproveDataOneTimePayments) {
      console.log("onApprove", data);
      const orderData = await captureOrderApiCall({
        orderId: data.orderId,
      });
      renderAlert({
        type: "success",
        message: `Order successfully captured! ${JSON.stringify(data)}`,
      });
      console.log("Capture result", orderData);
    },
    onCancel(data: OnCancelDataOneTimePayments) {
      console.log("onCancel", data);
      renderAlert({
        type: "warning",
        message: `onCancel() callback called ${data.orderId ?? ""}`,
      });
    },
    onError(error: OnErrorData) {
      console.log("onError", error);
      renderAlert({
        type: "danger",
        message: `onError() callback called: ${error}`,
      });
    },
  };
}

async function getBrowserSafeClientId() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-id", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch clientId");
  }

  type ClientIdResponse = {
    clientId: string;
  };

  const { clientId }: ClientIdResponse = await response.json();
  return clientId;
}
