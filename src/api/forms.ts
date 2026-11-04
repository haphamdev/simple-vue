import type { BookingInput, EventInput, ProfileInput } from '@/types/forms'

// Stand-in for an HTTP client: there is no backend, so log the request and fake some latency.
function fakeRequest(method: 'POST' | 'PUT', url: string, body: unknown): Promise<void> {
  console.log(`[API] ${method} ${url}`, body)
  return new Promise((resolve) => setTimeout(resolve, 500))
}

export function createEvent(data: EventInput) {
  return fakeRequest('POST', '/api/events', data)
}

export function updateEvent(id: number, data: EventInput) {
  return fakeRequest('PUT', `/api/events/${id}`, data)
}

export function createProfile(data: ProfileInput) {
  return fakeRequest('POST', '/api/profiles', data)
}

export function updateProfile(id: number, data: ProfileInput) {
  return fakeRequest('PUT', `/api/profiles/${id}`, data)
}

export function createBooking(data: BookingInput) {
  return fakeRequest('POST', '/api/bookings', data)
}
