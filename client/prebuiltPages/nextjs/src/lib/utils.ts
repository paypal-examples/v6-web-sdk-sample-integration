import type { CartItem } from "./product";

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
