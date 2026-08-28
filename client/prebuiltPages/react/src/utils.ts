import type { CartItem } from "./types";

export const getBrowserSafeClientId = async () => {
  const response = await fetch("/paypal-api/auth/browser-safe-client-id", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch client id");
  }
  const { clientId } = await response.json();

  return clientId;
};

/**
 * Fetches LPM-specific PayPal credentials (clientId + clientSecret).
 * Falls back to default credentials if the LPM doesn't have a dedicated app.
 */
export const getLpmCredentials = async (lpmName: string) => {
  const response = await fetch(
    `/paypal-api/auth/lpm-client-id/${encodeURIComponent(lpmName)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch LPM credentials for ${lpmName}`);
  }
  const { clientId, clientSecret } = await response.json();
  return { clientId, clientSecret };
};

export const fetchProducts = async () => {
  const response = await fetch("/paypal-api/products", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
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

  if (!response.ok) {
    throw new Error(`Failed to create order: ${response.status}`);
  }

  const { id } = await response.json();
  return { orderId: id };
};

/**
 * Creates an order for a Local Payment Method (LPM) one-time payment.
 *
 * LPMs require a method-specific `currencyCode` (e.g. EUR for iDEAL, PLN for
 * BLIK) and the `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction so
 * the order is completed when the buyer approves in the LPM popup. Both are
 * accepted by the existing `create-order-for-one-time-payment` endpoint.
 */
export const createLpmOrder = async ({
  cart,
  currencyCode,
}: {
  cart?: CartItem[];
  currencyCode: string;
}) => {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-one-time-payment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Omit `cart` when empty so the server applies its default demo cart.
        ...(cart && cart.length > 0 ? { cart } : {}),
        currencyCode,
        processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to create LPM order: ${response.status}`);
  }

  const { id } = await response.json();
  return { orderId: id };
};

export const createOrderWithVault = async (cart: CartItem[]) => {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-paypal-one-time-payment-with-vault",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to create order with vault: ${response.status}`);
  }

  const { id } = await response.json();
  return { orderId: id };
};

/**
 * Fetches the completed order details after LPM approval.
 *
 * LPMs always use `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`, which tells PayPal to
 * auto-capture/complete the order the moment the buyer approves in the popup.
 * Calling POST /capture afterwards would fail with ORDER_ALREADY_CAPTURED.
 * Instead, GET the order to confirm completion and retrieve order details.
 */
export const getOrder = async ({ orderId }: { orderId: string }) => {
  const response = await fetch(`/paypal-api/checkout/orders/${orderId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch order: ${response.status}`);
  }

  return response.json();
};

/**
 * Calls the server-side `find-eligible-methods` endpoint, matching the same
 * eligibility check the legacy vanilla-JS demos run via
 * `sdkInstance.findEligibleMethods({ currencyCode })`.
 *
 * Returns the raw PayPal response that can be passed directly to
 * `PayPalProvider.eligibleMethodsResponse` so the SDK uses server-side data
 * instead of making a second browser-side eligibility call.
 */
export const fetchEligibleMethods = async ({
  currencyCode,
  buyerCountryCode,
}: {
  currencyCode: string;
  buyerCountryCode?: string;
}) => {
  const response = await fetch("/paypal-api/payments/find-eligible-methods", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      purchase_units: [{ amount: { currency_code: currencyCode } }],
      ...(buyerCountryCode
        ? { customer: { country_code: buyerCountryCode } }
        : {}),
      preferences: { payment_flow: "ONE_TIME_PAYMENT" },
    }),
  });

  if (!response.ok) {
    throw new Error(`findEligibleMethods failed: ${response.status}`);
  }

  return response.json();
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

  if (!response.ok) {
    throw new Error(`Failed to capture order: ${response.status}`);
  }

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

export const createCardVaultToken = async () => {
  try {
    const response = await fetch(
      "/paypal-api/vault/create-setup-token-for-card-save-payment",
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
