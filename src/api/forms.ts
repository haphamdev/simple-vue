import { ApiError } from './ApiError'
import type { BookingPayload } from '@/schemas/booking'
import type { EventPayload } from '@/schemas/event'
import type { ProfilePayload } from '@/schemas/profile'

// Inputs that make the fake backend fail, to try out server error handling.
export const TAKEN_EMAIL = 'taken@example.com'
export const SERVER_ERROR_TEXT = 'server error'

// Stand-in for an HTTP client: there is no backend, so log the request and fake some latency.
function fakeRequest(method: 'POST' | 'PUT', url: string, body: object): Promise<void> {
  console.log(`[API] ${method} ${url}`, body)

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const entries = Object.entries(body)
      const isText = (value: unknown, text: string) =>
        typeof value === 'string' && value.trim().toLowerCase() === text

      if (entries.some(([, value]) => isText(value, SERVER_ERROR_TEXT))) {
        return reject(new ApiError(500, 'Something went wrong on the server. Please try again.'))
      }

      const takenEmails = entries.filter(([, value]) => isText(value, TAKEN_EMAIL))
      if (takenEmails.length) {
        const errors = Object.fromEntries(
          takenEmails.map(([key]) => [key, ['This email address is already in use.']]),
        )
        return reject(new ApiError(422, 'The given data was invalid.', errors))
      }

      resolve()
    }, 500)
  })
}

export function createEvent(data: EventPayload) {
  return fakeRequest('POST', '/api/events', data)
}

export function updateEvent(id: number, data: EventPayload) {
  return fakeRequest('PUT', `/api/events/${id}`, data)
}

export function createProfile(data: ProfilePayload) {
  return fakeRequest('POST', '/api/profiles', data)
}

export function updateProfile(id: number, data: ProfilePayload) {
  return fakeRequest('PUT', `/api/profiles/${id}`, data)
}

export function createBooking(data: BookingPayload) {
  return fakeRequest('POST', '/api/bookings', data)
}
