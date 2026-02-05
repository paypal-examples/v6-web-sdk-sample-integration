import { z, ZodError } from "zod/v4";
import type { Request, Response, NextFunction } from "express";

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
  } else {
    response.status(500).json({
      error: "Internal Server Error",
      errorDescription: error.toString(),
    });
  }
}
