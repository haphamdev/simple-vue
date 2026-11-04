import { z } from 'zod'

import {
  email,
  futureDateTime,
  integer,
  money,
  optionalText,
  requiredDateTime,
  requiredText,
} from '@/validation/fields'
import { endAfter } from '@/validation/refinements'
import type { FormState } from '@/validation/useZodForm'

const eventFields = z.object({
  title: requiredText({ max: 100 }),
  description: optionalText({ max: 1000 }),
  organizerEmail: email(),
  capacity: integer({ min: 1, max: 10000 }),
  ticketPrice: money(),
  startsAt: requiredDateTime(),
  endsAt: requiredDateTime(),
})

// An existing event may already have started, so only new events must start in the future.
// Cross-field checks are added last: Zod can't extend a schema that already has them.
export const editEventSchema = eventFields.check(endAfter('startsAt', 'endsAt'))

export const createEventSchema = eventFields
  .extend({ startsAt: futureDateTime() })
  .check(endAfter('startsAt', 'endsAt'))

// Values held by the form while the user edits: any field may still be empty (null).
export type EventFormValues = FormState<typeof editEventSchema>
// Data sent to the API after validation passes: no nulls, text trimmed.
export type EventPayload = z.output<typeof editEventSchema>
