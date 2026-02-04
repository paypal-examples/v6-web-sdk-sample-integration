export interface ProductItem {
  id: number;
  name: string;
  icon: string;
  price: number;
  image: {
    src: string;
    alt: string;
  };
  quantity: number;
}

export interface ModalContent {
  title: string;
  message: string;
}

export type ModalType = "success" | "cancel" | "error" | null;
