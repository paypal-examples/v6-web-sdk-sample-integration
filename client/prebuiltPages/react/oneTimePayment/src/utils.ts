export const getBrowserSafeClientToken = async () => {
  {
    const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { accessToken } = await response.json();

    return accessToken;
  }
};

export const createOrder = async () => {
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
};

export const captureOrder = async ({ orderId }: { orderId: string }) => {
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
};

// POST /paypal-api/vault/setup-token/create
export const createSetupToken = async () => {
  const response = await fetch("/paypal-api/vault/setup-token/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { id } = await response.json();
  
  return { vaultSetupToken: id };
}