import { z } from 'zod'

import {
  email,
  futureDateTime,
  integer,
  optionalText,
  requiredDateTime,
  requiredText,
} from '@/validation/fields'
import { endAfter, maxDuration, sumAtMost } from '@/validation/refinements'
import type { FormState } from '@/validation/useZodForm'

const roomType = z.enum(['single', 'double', 'family'])

export type RoomType = z.infer<typeof roomType>

// Shared by the room select and the capacity rule below.
export const roomTypes: { title: string; value: RoomType; capacity: number }[] = [
  { title: 'Single (1 guest)', value: 'single', capacity: 1 },
  { title: 'Double (2 guests)', value: 'double', capacity: 2 },
  { title: 'Family (4 guests)', value: 'family', capacity: 4 },
]

function capacityOf(value: RoomType) {
  return roomTypes.find((room) => room.value === value)?.capacity ?? null
}

export const bookingSchema = z
  .object({
    guestName: requiredText({ max: 100 }),
    guestEmail: email(),
    checkIn: futureDateTime(),
    checkOut: requiredDateTime(),
    roomType,
    adults: integer({ min: 1, max: 10 }),
    children: integer({ min: 0, max: 10 }),
    specialRequests: optionalText({ max: 500 }),
  })
  .check(endAfter('checkIn', 'checkOut', 'Check-out must be after check-in'))
  .check(maxDuration('checkIn', 'checkOut', 30, 'A stay can be at most {days} nights'))
  .check(
    sumAtMost(
      ['adults', 'children'],
      (booking) => capacityOf(booking.roomType),
      'roomType',
      'Too many guests for this room (max {max})',
    ),
  )

// Values held by the form while the user edits: any field may still be empty (null).
export type BookingFormValues = FormState<typeof bookingSchema>
// Data sent to the API after validation passes: no nulls, text trimmed.
export type BookingPayload = z.output<typeof bookingSchema>
