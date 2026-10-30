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
    // PAYPAL_ACCESS_TOKEN can't be refreshed, so point at the likely causes
    if (statusCode === 401 && process.env.PAYPAL_ACCESS_TOKEN) {
      console.error(
        "PayPal returned 401 while PAYPAL_ACCESS_TOKEN is set: the token may have expired (with `paypal dev`, restart it), or PAYPAL_SANDBOX_CLIENT_SECRET belongs to a different app than PAYPAL_CLIENT_ID.",
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
