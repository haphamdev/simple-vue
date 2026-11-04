<script setup lang="ts">
import { ref } from 'vue'

import DateTimeField from './DateTimeField.vue'
import EmailField from './fields/EmailField.vue'
import NameField from './fields/NameField.vue'
import { createBooking } from '@/api/forms'
import type { BookingInput, RoomType } from '@/types/forms'

const roomTypes: { title: string; value: RoomType; capacity: number }[] = [
  { title: 'Single (1 guest)', value: 'single', capacity: 1 },
  { title: 'Double (2 guests)', value: 'double', capacity: 2 },
  { title: 'Family (4 guests)', value: 'family', capacity: 4 },
]

const form = ref<BookingInput>({
  guestName: '',
  guestEmail: '',
  checkIn: null,
  checkOut: null,
  adults: null,
  children: null,
  roomType: null,
  specialRequests: '',
})

const submitting = ref(false)

async function onSubmit() {
  submitting.value = true
  try {
    await createBooking(form.value)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <v-card title="Book a room">
    <v-card-text>
      <v-form @submit.prevent="onSubmit">
        <NameField v-model="form.guestName" label="Guest name" />
        <EmailField v-model="form.guestEmail" label="Guest email" />

        <DateTimeField v-model="form.checkIn" label="Check-in" />
        <DateTimeField v-model="form.checkOut" label="Check-out" />

        <v-select v-model="form.roomType" :items="roomTypes" label="Room type" />

        <v-row dense>
          <v-col cols="12" sm="6">
            <v-number-input v-model="form.adults" label="Adults" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-number-input v-model="form.children" label="Children" />
          </v-col>
        </v-row>

        <v-textarea v-model="form.specialRequests" label="Special requests" rows="3" />

        <v-btn type="submit" color="primary" :loading="submitting">Book room</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
