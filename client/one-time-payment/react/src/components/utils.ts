import { PaymentSessionOptions } from "../types/paypal";

const getBrowserSafeClientToken = async () => {
  {
    const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { access_token } = await response.json();

    return access_token;
  }
}

export const createOrder = async () => {
  const response = await fetch(
    "/paypal-api/checkout/orders/create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const orderData = await response.json();
  return { orderId: orderData.id };
};

const captureOrder = async ({ orderId }: { orderId: string }) => {
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

export const paymentSessionOptions: PaymentSessionOptions = {
  async onApprove(data) {
    console.log("onApprove", data);
    const orderData = await captureOrder({
      orderId: data.orderId,
    });
    console.log("Capture result", orderData);
    if (orderData.status === "COMPLETED") {
      window.location.replace("/success"); // Redirect to success
    } else {
      window.location.replace("/failure"); // Redirect to failure
    }
  },
  onCancel(data) {
    console.log("onCancel", data);
  },
  onError(error) {
    console.log("onError", error);
  },
};

export const initSdkInstance = async () => {
  const clientToken = await getBrowserSafeClientToken();
  const sdkInstance = await window.paypal.createInstance({
    clientToken,
    components: ["paypal-payments", "venmo-payments"],
    pageType: "checkout",
  });
  // Check Payment Method Eligibility
  const paymentMethods = await sdkInstance.findEligibleMethods({
    currency: "USD",
  });

  return {
    sdkInstance,
    isPayPalEligible: paymentMethods.isEligible("paypal"),
    isVenmoEligible: paymentMethods.isEligible("venmo")
  };
};