import { z } from "zod";

import type { EventInput } from "@/types/forms";
import { dateRange, futureDate, money, required, requiredEmail, requiredString } from "./rules";

export const eventSchema = z
  .object({
    title: requiredString("Title is required").max(100),
    description: z.string().max(500),
    organizerEmail: requiredEmail("Organizer email is required"),
    capacity: required(
      z.number().int("Capacity must be a whole number").min(100, "Capacity must be at least 100"),
      "Capacity is required",
    ),
    ticketPrice: required(money("Ticket price cannot be negative"), "Ticket price is required"),
    startsAt: required(futureDate("Start time must be in the future"), "Start time is required"),
    endsAt: required(z.date(), "End time is required"),
  })
  .refine(...dateRange("startsAt", "endsAt", "End time must be after start time")) satisfies z.ZodType<EventInput>;
