// Server maintains SKU, name, and price mapping for validation and debugging
export interface Product {
  sku: string;
  name: string;
  price: string;
}

export const PRODUCT_CATALOG: Record<string, Product> = {
  "1blwyeo8": {
    sku: "1blwyeo8",
    name: "World Cup Ball",
    price: "75.00",
  },
  i5b1g92y: {
    sku: "i5b1g92y",
    name: "Professional Basketball",
    price: "55.00",
  },
  "3xk9m4n2": {
    sku: "3xk9m4n2",
    name: "Official Baseball",
    price: "10.00",
  },
  "7pq2r5t8": {
    sku: "7pq2r5t8",
    name: "Hockey Puck",
    price: "15.00",
  },
};

export function getProduct(sku: string): Product {
  if (!PRODUCT_CATALOG[sku]) {
    throw new Error(`Product with SKU ${sku} not found`);
  }
  return PRODUCT_CATALOG[sku];
}

export function getAllProducts(): Product[] {
  return Object.values(PRODUCT_CATALOG);
}

export function getProductPrice(sku: string): string | undefined {
  return PRODUCT_CATALOG[sku]?.price;
}
