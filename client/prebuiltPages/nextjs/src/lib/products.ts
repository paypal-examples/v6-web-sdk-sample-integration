export const products = {
  "1blwyeo8": {
    sku: "1blwyeo8",
    name: "World Cup Ball",
    price: "75.00",
    tagline: "Precision. Control. Perfection.",
    description:
      "Tournament-grade match ball engineered for peak performance. Thermal-bonded panels deliver consistent flight and true touch in every condition.",
  },
};

export function getProduct(sku: string) {
  const product = products[sku as keyof typeof products];
  if (!product) {
    throw new Error(`Product not found: ${sku}`);
  }
  return product;
}

export function getAllProducts() {
  return Object.values(products);
}
