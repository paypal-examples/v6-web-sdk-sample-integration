import type { Request, Response } from "express";
import { getAllProducts } from "../productCatalog";

export function getProductsRouteHandler(_request: Request, response: Response) {
  const products = getAllProducts();
  response.status(200).json(products);
}
