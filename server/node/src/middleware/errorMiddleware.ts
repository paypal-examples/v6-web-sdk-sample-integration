import { z, ZodError } from "zod/v4";
import { ApiError } from "@paypal/paypal-server-sdk";
import type { Request, Response, NextFunction } from "express";

import { CustomApiError } from "../customApiEndpoints/customApiError";

export default async function errorMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: "Bad Request",
      errorDescription: z.prettifyError(error),
    });
  } else if (error instanceof ApiError || error instanceof CustomApiError) {
    const { result, statusCode } = error;
    // PAYPAL_ACCESS_TOKEN can't be refreshed, so point at the likely cause
    if (statusCode === 401 && process.env.PAYPAL_ACCESS_TOKEN) {
      console.error(
        "PayPal rejected PAYPAL_ACCESS_TOKEN; it may have expired. Set a new one (with `paypal dev`, restart it).",
      );
    }
    response.status(statusCode).json(result);
  } else {
    response.status(500).json({
      error: "Internal Server Error",
      errorDescription: error.toString(),
    });
  }
}
