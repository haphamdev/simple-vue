import { z } from "zod";

import type { ProfileInput } from "@/types/forms";
import { optionalUrl, pastDate, phone, required, requiredEmail, requiredString } from "./rules";

export const profileSchema = z.object({
  fullName: requiredString("Full name is required").max(100),
  email: requiredEmail(),
  phone: requiredString("Phone is required").pipe(phone()),
  age: required(
    z.number().int("Age must be a whole number").min(1, "Age must be at least 1").max(120),
    "Age is required",
  ),
  dateOfBirth: required(pastDate("Date of birth must be in the past"), "Date of birth is required"),
  website: optionalUrl(),
}) satisfies z.ZodType<ProfileInput>;
