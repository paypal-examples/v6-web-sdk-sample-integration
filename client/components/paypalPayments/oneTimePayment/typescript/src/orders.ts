type OrderResponseMinimal = {
  id: string;
  status: string;
  links: {
    href: string;
    rel: string;
    method: string;
  }[];
};

export async function createOrderApiCall() {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-one-time-payment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create order");
  }

  const { id }: OrderResponseMinimal = await response.json();
  return { orderId: id };
}

export async function captureOrderApiCall({ orderId }: { orderId: string }) {
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
    throw new Error("Failed to capture order");
  }

  type OrderResponse = OrderResponseMinimal & {
    payer: Record<string, unknown>;
    paymentSource: Record<string, unknown>;
    purchaseUnits: Record<string, unknown>[];
  };

  const data: OrderResponse = await response.json();
  return data;
}
