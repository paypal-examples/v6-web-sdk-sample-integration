import type {
  PayPalV6Namespace,
  SdkInstance,
  OnApproveDataOneTimePayments,
  FindEligibleMethodsGetDetails,
} from "@paypal/paypal-js/sdk-v6";

declare global {
  interface Window {
    paypal: PayPalV6Namespace;
    onPayPalWebSdkLoaded: () => void;
  }
}

window.onPayPalWebSdkLoaded = async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-payments"],
      pageType: "checkout",
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "USD",
    });

    if (paymentMethods.isEligible("paypal")) {
      setupPayPalButton(sdkInstance);
    }

    if (paymentMethods.isEligible("paylater")) {
      const paylaterPaymentMethodDetails =
        paymentMethods.getDetails("paylater");
      setupPayLaterButton(sdkInstance, paylaterPaymentMethodDetails);
    }

    if (paymentMethods.isEligible("credit")) {
      const paypalCreditPaymentMethodDetails =
        paymentMethods.getDetails("credit");
      setupPayPalCreditButton(sdkInstance, paypalCreditPaymentMethodDetails);
    }
  } catch (error) {
    console.error(error);
  }
}

async function onApproveCallback(data: OnApproveDataOneTimePayments) {
  console.log("onApprove", data);
  const orderData = await captureOrder({
    orderId: data.orderId,
  });
  console.log("Capture result", orderData);
}

async function setupPayPalButton(
  sdkInstance: SdkInstance<["paypal-payments"]>,
) {
  const paypalPaymentSession = sdkInstance.createPayPalOneTimePaymentSession({
    onApprove: onApproveCallback,
  });

  const paypalButton = document.querySelector("#paypal-button");
  paypalButton?.removeAttribute("hidden");

  paypalButton?.addEventListener("click", async () => {
    try {
      await paypalPaymentSession.start(
        { presentationMode: "auto" },
        createOrder(),
      );
    } catch (error) {
      console.error(error);
    }
  });
}

async function setupPayLaterButton(
  sdkInstance: SdkInstance<["paypal-payments"]>,
  paylaterPaymentMethodDetails: FindEligibleMethodsGetDetails<"paylater">,
) {
  const paylaterPaymentSession =
    sdkInstance.createPayLaterOneTimePaymentSession({
      onApprove: onApproveCallback,
    });

  const { productCode, countryCode } = paylaterPaymentMethodDetails;
  const paylaterButton = document.querySelector("#paylater-button");

  if (paylaterButton && productCode && countryCode) {
    paylaterButton.setAttribute("productCode", productCode);
    paylaterButton.setAttribute("countryCode", countryCode);
    paylaterButton?.removeAttribute("hidden");

    paylaterButton?.addEventListener("click", async () => {
      try {
        await paylaterPaymentSession.start(
          { presentationMode: "auto" },
          createOrder(),
        );
      } catch (error) {
        console.error(error);
      }
    });
  }
}

async function setupPayPalCreditButton(
  sdkInstance: SdkInstance<["paypal-payments"]>,
  paypalCreditPaymentMethodDetails: FindEligibleMethodsGetDetails<"credit">,
) {
  const paypalCreditPaymentSession =
    sdkInstance.createPayPalCreditOneTimePaymentSession({
      onApprove: onApproveCallback,
    });

  const { countryCode } = paypalCreditPaymentMethodDetails;
  const paypalCreditButton = document.querySelector("#paypal-credit-button");

  if (paypalCreditButton && countryCode) {
    paypalCreditButton.setAttribute("countryCode", countryCode);
    paypalCreditButton.removeAttribute("hidden");

    paypalCreditButton.addEventListener("click", async () => {
      try {
        await paypalCreditPaymentSession.start(
          { presentationMode: "auto" },
          createOrder(),
        );
      } catch (error) {
        console.error(error);
      }
    });
  }
}

async function getBrowserSafeClientToken() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  type ClientTokenReponse = {
    accessToken: string;
    expiresIn: number;
    scope: string;
    tokenType: string;
  };

  const { accessToken }: ClientTokenReponse = await response.json();

  return accessToken;
}

type OrderResponseMinimal = {
  id: string;
  status: string;
  links: {
    href: string;
    rel: string;
    method: string;
  }[];
};

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
  const { id }: OrderResponseMinimal = await response.json();

  return { orderId: id };
}

async function captureOrder({ orderId }: { orderId: string }) {
  const response = await fetch(
    `/paypal-api/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  type OrderResponse = OrderResponseMinimal & {
    payer: Record<string, any>;
    paymentSource: Record<string, any>;
    purchaseUnits: Record<string, any>[];
  };

  const data: OrderResponse = await response.json();

  return data;
}
