import { z } from "zod";

// Reusable zod rules shared across form schemas.

// Keeps the field nullable (matches `number | null` / `Date | null` form types) but rejects null.
export function required<T extends z.ZodTypeAny>(schema: T, message = "This field is required") {
  return schema.nullable().refine((v) => v !== null, message);
}

export function requiredString(message = "This field is required") {
  return z.string().trim().min(1, message);
}

export function email(message = "Invalid email") {
  return z.string().trim().email(message);
}

export function requiredEmail(requiredMessage = "Email is required", message = "Invalid email") {
  return requiredString(requiredMessage).email(message);
}

// Empty string is allowed; anything else must be a valid http(s) URL.
export function optionalUrl(message = "Invalid URL") {
  return z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\/\S+\.\S+/.test(v), message);
}

// Digits with optional leading +, spaces, dashes, dots or parentheses; 7–15 digits in total.
export function phone(message = "Invalid phone number") {
  return z
    .string()
    .trim()
    .refine((v) => /^\+?[\d\s\-().]+$/.test(v), message)
    .refine((v) => {
      const digits = v.replace(/\D/g, "").length;
      return digits >= 7 && digits <= 15;
    }, message);
}

// Non-negative amount with at most 2 decimal places.
export function money(message = "Amount cannot be negative") {
  return z.number().min(0, message).multipleOf(0.01, "Amount can have at most 2 decimals");
}

export function positiveInt(message = "Must be a whole number of at least 1") {
  return z.number().int(message).min(1, message);
}

// `new Date()` is evaluated on each validation, not once at schema creation.
export function pastDate(message = "Date must be in the past") {
  return z.date().refine((d) => d < new Date(), message);
}

export function futureDate(message = "Date must be in the future") {
  return z.date().refine((d) => d > new Date(), message);
}

// Object-level check for a date range; attach with `.refine(...dateRange("startsAt", "endsAt"))`.
export function dateRange<K extends string>(
  startKey: K,
  endKey: K,
  message = "End must be after start",
): [(data: Record<K, Date | null>) => boolean, { message: string; path: string[] }] {
  return [
    (data) => {
      const start = data[startKey];
      const end = data[endKey];
      return !start || !end || end > start;
    },
    { message, path: [endKey] },
  ];
}
