import { z } from "zod";

export const cartItemSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

export const cartRequestSchema = z.object({
  cart: z
    .array(cartItemSchema)
    .min(1, "Cart must contain at least one item")
    .max(100, "Cart cannot contain more than 100 items"),
});

export type CartRequest = z.infer<typeof cartRequestSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
