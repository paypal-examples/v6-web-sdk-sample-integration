import type { CartItem } from "../../types";

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
