import { z } from 'zod'

import { email, integer, optionalUrl, pastDate, phone, requiredText } from '@/validation/fields'
import { ageMatchesBirthDate } from '@/validation/refinements'
import type { FormState } from '@/validation/useZodForm'

// Same rules for create and edit.
export const profileSchema = z
  .object({
    fullName: requiredText({ max: 100 }),
    email: email(),
    phone: phone(),
    age: integer({ min: 0, max: 130 }),
    dateOfBirth: pastDate(),
    website: optionalUrl(),
  })
  .check(ageMatchesBirthDate('age', 'dateOfBirth'))

// Values held by the form while the user edits: any field may still be empty (null).
export type ProfileFormValues = FormState<typeof profileSchema>
// Data sent to the API after validation passes: no nulls, text trimmed, empty website → null.
export type ProfilePayload = z.output<typeof profileSchema>
