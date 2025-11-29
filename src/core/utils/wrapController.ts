import { asyncHandler } from "./asyncHandler";

export function wrapController<T extends object>(controller: T): T {
  const wrapped: any = {};

  for (const key of Object.getOwnPropertyNames(
    Object.getPrototypeOf(controller)
  )) {
    const value = (controller as any)[key];
    if (typeof value === "function" && key !== "constructor") {
      wrapped[key] = asyncHandler(value.bind(controller));
    }
  }

  return wrapped as T;
}
