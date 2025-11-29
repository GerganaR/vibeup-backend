import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";
import { BadRequestError, ConflictError } from "./httpErrors";

export function mapSequelizeError(err: any) {
  if (err instanceof ValidationError) {
    return new BadRequestError(
      err.errors.map((e) => e.message).join(", "),
      err.errors
    );
  }

  if (err instanceof UniqueConstraintError) {
    return new ConflictError(
      err.errors.map((e) => e.message).join(", "),
      err.errors
    );
  }

  if (err instanceof ForeignKeyConstraintError) {
    return new BadRequestError("Invalid reference ID", err);
  }

  return err;
}
