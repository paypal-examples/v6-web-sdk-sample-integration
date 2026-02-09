export interface ProductItem {
  id: number;
  sku: string;
  name: string;
  description: string;
  icon: string;
  price?: number;
  image: {
    src: string;
    alt: string;
  };
  quantity: number;
}
export interface ProductPrice {
  sku: string;
  price: string;
}
export interface CartItem {
  sku: string;
  quantity: number;
}
export interface ModalContent {
  title: string;
  message: string;
}

export type ModalType = "success" | "cancel" | "error" | null;
