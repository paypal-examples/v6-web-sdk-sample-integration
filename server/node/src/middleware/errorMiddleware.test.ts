import { afterEach, describe, expect, test, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

import errorMiddleware from "./errorMiddleware";
import { CustomApiError } from "../customApiEndpoints/customApiError";

function respond(error: Error) {
  const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  errorMiddleware(
    error,
    {} as Request,
    response as unknown as Response,
    vi.fn() as NextFunction,
  );
  return response;
}

const unauthorized = new CustomApiError({
  message: "Authentication failed",
  statusCode: 401,
  result: {},
});

describe("errorMiddleware", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("points at the likely causes of a 401 while PAYPAL_ACCESS_TOKEN is set", () => {
    vi.stubEnv("PAYPAL_ACCESS_TOKEN", "injected-token");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const response = respond(unauthorized);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringMatching(/may have expired.*belongs to a different app/),
    );
  });

  test("logs nothing extra for a 401 without an access token", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    respond(unauthorized);

    expect(consoleError).not.toHaveBeenCalled();
  });
});
