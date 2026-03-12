export const PRODUCT = {
  name: "World Cup Ball",
  tagline: "Precision. Control. Perfection.",
  description:
    "Tournament-grade match ball engineered for peak performance. Thermal-bonded panels deliver consistent flight and true touch in every condition.",
  price: "75.00",
  sku: "1blwyeo8",
};

export type CartItem = {
  sku: string;
  quantity: number;
};

const CART_KEY = "paypal-cart";

export const getCart = (): CartItem | null => {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveCart = (item: CartItem): void => {
  sessionStorage.setItem(CART_KEY, JSON.stringify(item));
};

export const clearCart = (): void => {
  sessionStorage.removeItem(CART_KEY);
};
