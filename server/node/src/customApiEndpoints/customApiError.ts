export class CustomApiError extends Error {
  statusCode: number;
  result: Record<string, unknown>;

  constructor({
    message,
    statusCode,
    result,
  }: {
    message: string;
    statusCode: number;
    result: Record<string, unknown>;
  }) {
    super(message);
    this.statusCode = statusCode;
    this.result = result;
  }
}
