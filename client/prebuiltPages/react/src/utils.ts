import type { CartItem } from "./types";

export const getBrowserSafeClientToken = async () => {
  const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { accessToken } = await response.json();

  return accessToken;
};

export const fetchProducts = async () => {
  const response = await fetch("/paypal-api/products", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await response.json();
};

export const createOrder = async (cart: CartItem[]) => {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-one-time-payment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart }),
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
    const response = await fetch("/paypal-api/billing/create-subscription", {
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
      "/paypal-api/vault/create-setup-token-for-paypal-save-payment",
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

/**
 * Fetches eligible payment methods from the server.
 * This demonstrates server-side eligibility - the server calls PayPal's API
 * and returns the response to hydrate the PayPalProvider context.
 */
export const fetchEligibleMethods = async () => {
  const response = await fetch("/paypal-api/payments/find-eligible-methods", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer: {
        country_code: "US",
      },
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
          },
        },
      ],
      preferences: {
        include_account_features: true,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Eligibility fetch failed: ${response.status}`);
  }

  return await response.json();
};
