<script setup lang="ts">
import BookingForm from './components/BookingForm.vue'
import EventForm from './components/EventForm.vue'
import ProfileForm from './components/ProfileForm.vue'
import type { EventInput, ProfileInput } from './types/forms'

// Pretend these were loaded from the backend for the edit forms.
const existingEvent: EventInput = {
  title: 'Autumn wine tasting',
  description: 'An evening of local wines on the rooftop terrace.',
  organizerEmail: 'events@example.com',
  capacity: 40,
  ticketPrice: 25.5,
  startsAt: new Date(2026, 11, 12, 18, 0),
  endsAt: new Date(2026, 11, 12, 21, 30),
}

const existingProfile: ProfileInput = {
  fullName: 'Alex Nguyen',
  email: 'alex@example.com',
  phone: '+84 90 123 4567',
  age: 32,
  dateOfBirth: new Date(1994, 2, 15),
  website: 'https://example.com',
}
</script>

<template>
  <v-app>
    <v-main>
      <v-container max-width="720" class="d-flex flex-column ga-6 py-8">
        <EventForm />
        <EventForm :id="42" :initial-values="existingEvent" />
        <ProfileForm />
        <ProfileForm :id="7" :initial-values="existingProfile" />
        <BookingForm />
      </v-container>
    </v-main>
  </v-app>
</template>
