export type RoomType = 'single' | 'double' | 'family'

export interface BookingInput {
  guestName: string
  guestEmail: string
  checkIn: Date | null
  checkOut: Date | null
  adults: number | null
  children: number | null
  roomType: RoomType | null
  specialRequests: string
}
