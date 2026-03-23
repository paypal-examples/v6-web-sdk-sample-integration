import type { Request, Response, NextFunction } from "express";

export default async function crossOriginOpenerPolicyMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (
    request.accepts("html") &&
    request.method === "GET" &&
    request.url.endsWith(".html")
  ) {
    response.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  }
  next();
}
