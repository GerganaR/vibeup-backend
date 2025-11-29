import { ErrorCode } from "./ErrorCode";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: ErrorCode = ErrorCode.INTERNAL,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
