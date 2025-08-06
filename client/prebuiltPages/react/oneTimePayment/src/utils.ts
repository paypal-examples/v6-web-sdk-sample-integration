/**
 * Fetches a browser-safe client token from the server for PayPal SDK initialization.
 *
 * @async
 * @function
 * @returns {Promise<string>} The browser-safe client access token.
 */
export const getBrowserSafeClientToken = async (): Promise<string> => {
  const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { accessToken } = await response.json();

  return accessToken;
};

/**
 * Creates a PayPal order by sending a request to the server.
 *
 * @async
 * @function
 * @returns {Promise<{ orderId: string }>} The created order object containing the order ID.
 */
export const createOrder = async (): Promise<{ orderId: string }> => {
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

/**
 * Captures a PayPal order by order ID.
 *
 * @async
 * @function
 * @param {Object} params - The parameters object.
 * @param {string} params.orderId - The PayPal order ID.
 * @returns {Promise<any>} The capture order response data.
 */
export const captureOrder = async ({
  orderId,
}: {
  orderId: string;
}): Promise<any> => {
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
