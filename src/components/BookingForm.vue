<script setup lang="ts">
import DateTimeField from './DateTimeField.vue'
import EmailField from './fields/EmailField.vue'
import NameField from './fields/NameField.vue'
import { createBooking } from '@/api/forms'
import { bookingSchema, roomTypes } from '@/schemas/booking'
import { useZodForm } from '@/validation/useZodForm'

const { form, formRef, field, submit, submitting } = useZodForm(bookingSchema, {
  guestName: '',
  guestEmail: '',
  checkIn: null,
  checkOut: null,
  roomType: null,
  adults: null,
  children: 0,
  specialRequests: '',
})

function onSubmit() {
  return submit(createBooking)
}
</script>

<template>
  <v-card title="Book a room">
    <v-card-text>
      <v-form ref="formRef" @submit.prevent="onSubmit">
        <NameField v-model="form.guestName" label="Guest name" v-bind="field('guestName')" />
        <EmailField v-model="form.guestEmail" label="Guest email" v-bind="field('guestEmail')" />

        <DateTimeField v-model="form.checkIn" label="Check-in" v-bind="field('checkIn')" />
        <DateTimeField v-model="form.checkOut" label="Check-out" v-bind="field('checkOut')" />

        <v-select
          v-model="form.roomType"
          :items="roomTypes"
          label="Room type"
          v-bind="field('roomType')"
        />

        <v-row dense>
          <v-col cols="12" sm="6">
            <v-number-input v-model="form.adults" label="Adults" v-bind="field('adults')" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-number-input v-model="form.children" label="Children" v-bind="field('children')" />
          </v-col>
        </v-row>

        <v-textarea
          v-model="form.specialRequests"
          label="Special requests"
          rows="3"
          v-bind="field('specialRequests')"
        />

        <v-btn type="submit" color="primary" :loading="submitting">Book room</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
