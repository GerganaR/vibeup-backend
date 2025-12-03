import { AppError } from "./AppError";
import { ErrorCode } from "./ErrorCode";

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", details?: any) {
    super(message, 400, ErrorCode.BAD_REQUEST, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, ErrorCode.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, ErrorCode.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found", details?: any) {
    super(message, 404, ErrorCode.NOT_FOUND, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: any) {
    super(message, 409, ErrorCode.CONFLICT, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error", details?: any) {
    super(message, 500, ErrorCode.INTERNAL, details);
  }
}
