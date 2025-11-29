import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";

export function correlationId(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  (req as any).correlationId = uuid();
  next();
}
