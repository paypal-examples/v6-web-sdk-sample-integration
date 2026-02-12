import { z } from "zod/v4";
import type { Request, Response } from "express";

import { findEligibleMethods } from "../customApiEndpoints/findEligibleMethods";

export async function findEligibleMethodsRouteHandler(
  request: Request,
  response: Response,
) {
  const result = await findEligibleMethods({
    body: request.body,
    userAgent: z.string().parse(request.get("user-agent")),
  });

  response.status(200).json(result);
}
