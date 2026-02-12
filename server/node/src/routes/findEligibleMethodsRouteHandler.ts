import { z } from "zod/v4";
import type { Request, Response } from "express";

import { findEligibleMethods } from "../customApiEndpoints/findEligibleMethods";
import { CustomApiError } from "../customApiEndpoints/utils";

export async function findEligibleMethodsRouteHandler(
  request: Request,
  response: Response,
) {
  try {
    const result = await findEligibleMethods({
      body: request.body,
      userAgent: z.string().parse(request.get("user-agent")),
    });

    response.status(200).json(result);
  } catch (error) {
    console.error("Failed to find eligible methods:", error);

    if ((error as CustomApiError)?.statusCode) {
      const { statusCode, result } = error as CustomApiError;
      response.status(statusCode).json(result);
    }
    throw error;
  }
}
