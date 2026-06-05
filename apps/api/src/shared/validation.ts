import { z } from "zod";
import { roles } from "../domain/types.js";
import { AppError } from "../middleware/errorHandler.js";

export const roleSchema = z.enum(roles);

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  role: roleSchema
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").optional(),
    role: roleSchema.optional()
  })
  .strict()
  .refine((value) => value.name !== undefined || value.role !== undefined, {
    message: "At least one field must be provided"
  });

export const createBookingSchema = z
  .object({
    startTime: z.string(),
    endTime: z.string()
  })
  .strict();

export function parseId(value: string | undefined, label: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, `${label} must be a positive integer`);
  }
  return id;
}

export function parseUtcIsoDate(value: string, label: string): Date {
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  const timestamp = Date.parse(value);

  if (!hasTimezone || Number.isNaN(timestamp)) {
    throw new AppError(400, `${label} must be a valid UTC ISO timestamp`);
  }

  return new Date(timestamp);
}

export function parseZod<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new AppError(
      400,
      "Validation failed",
      result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    );
  }
  return result.data;
}
