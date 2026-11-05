import { z } from "zod";

import type { BookingInput, RoomType } from "@/types/forms";
import {
  dateRange,
  futureDate,
  positiveInt,
  required,
  requiredEmail,
  requiredString,
} from "./rules";

export const roomCapacity: Record<RoomType, number> = {
  single: 1,
  double: 2,
  family: 4,
};

export const bookingSchema = z
  .object({
    guestName: requiredString("Guest name is required").max(100),
    guestEmail: requiredEmail("Guest email is required"),
    checkIn: required(futureDate("Check-in must be in the future"), "Check-in is required"),
    checkOut: required(z.date(), "Check-out is required"),
    adults: required(positiveInt("At least 1 adult is required"), "Adults is required"),
    children: z.number().int("Must be a whole number").min(0, "Cannot be negative").nullable(),
    roomType: required(z.enum(["single", "double", "family"]), "Room type is required"),
    specialRequests: z.string().max(500),
  })
  .refine(...dateRange("checkIn", "checkOut", "Check-out must be after check-in"))
  .refine(
    (data) =>
      !data.roomType || (data.adults ?? 0) + (data.children ?? 0) <= roomCapacity[data.roomType],
    { message: "Too many guests for this room type", path: ["roomType"] },
  ) satisfies z.ZodType<BookingInput>;
