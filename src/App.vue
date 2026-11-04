<script setup lang="ts">
import BookingForm from './components/BookingForm.vue'
import EventForm from './components/EventForm.vue'
import ProfileForm from './components/ProfileForm.vue'
import { SERVER_ERROR_TEXT, TAKEN_EMAIL } from './api/forms'
import type { EventFormValues } from './schemas/event'
import type { ProfileFormValues } from './schemas/profile'

// Pretend these were loaded from the backend for the edit forms.
const existingEvent: EventFormValues = {
  title: 'Autumn wine tasting',
  description: 'An evening of local wines on the rooftop terrace.',
  organizerEmail: 'events@example.com',
  capacity: 40,
  ticketPrice: 25.5,
  startsAt: new Date(2026, 11, 12, 18, 0),
  endsAt: new Date(2026, 11, 12, 21, 30),
}

const existingProfile: ProfileFormValues = {
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
        <v-alert type="info" variant="tonal" title="Try the fake backend errors">
          Submit a valid form with <code>{{ TAKEN_EMAIL }}</code> in an email field to get a field
          error, or type <code>{{ SERVER_ERROR_TEXT }}</code> in any text field to get a server error.
        </v-alert>
        <EventForm />
        <EventForm :id="42" :initial-values="existingEvent" />
        <ProfileForm />
        <ProfileForm :id="7" :initial-values="existingProfile" />
        <BookingForm />
      </v-container>
    </v-main>
  </v-app>
</template>
