import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";
import { mapSequelizeError } from "./sequelizeErrorMapper";
import { logger } from "@/core/logger/logger";
import { ErrorCode } from "./ErrorCode";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  err = mapSequelizeError(err);

  const isProd = process.env.NODE_ENV === "production";
  const status = err instanceof AppError ? err.statusCode : 500;

  const response = {
    success: false,
    message: err.message || "Something went wrong",
    code: err.code || ErrorCode.INTERNAL,
    details: err.details || null,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    correlationId: (req as any).correlationId,
    ...(isProd ? {} : { stack: err.stack }),
  };

  // Log the full structured error
  logger.error({
    ...response,
    body: req.body,
    params: req.params,
    query: req.query,
    method: req.method,
  });

  res.status(status).json(response);
}
