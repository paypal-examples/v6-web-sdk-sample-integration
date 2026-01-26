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

export const createSubscription = async () => {
  try {
    const response = await fetch("/paypal-api/subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    console.log("Subscription created:", data);

    return { subscriptionId: data.id };
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};

export const createVaultToken = async () => {
  try {
    const response = await fetch(
      "/paypal-api/vault/setup-token/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Vault token created:", data);

    return { vaultSetupToken: data.id };
  } catch (error) {
    console.error("Error creating vault token:", error);
    throw error;
  }
};
