<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

import DateTimeField from "./DateTimeField.vue";
import { createBooking } from "@/api/forms";
import type { BookingInput, RoomType } from "@/types/forms";
import { bookingSchema, roomCapacity } from "@/validation/bookingSchema";

const roomTypes: { title: string; value: RoomType }[] = [
  { title: `Single (${roomCapacity.single} guest)`, value: "single" },
  { title: `Double (${roomCapacity.double} guests)`, value: "double" },
  { title: `Family (${roomCapacity.family} guests)`, value: "family" },
];

// Explicit type: vee-validate can't infer it from the schema when initialValues is also passed.
const { defineField, errors, handleSubmit, isSubmitting } = useForm<BookingInput>({
  validationSchema: toTypedSchema(bookingSchema),
  initialValues: {
    guestName: "",
    guestEmail: "",
    checkIn: null,
    checkOut: null,
    adults: null,
    children: null,
    roomType: null,
    specialRequests: "",
  },
});

const [guestName] = defineField("guestName");
const [guestEmail] = defineField("guestEmail");
const [checkIn] = defineField("checkIn");
const [checkOut] = defineField("checkOut");
const [adults] = defineField("adults");
const [children] = defineField("children");
const [roomType] = defineField("roomType");
const [specialRequests] = defineField("specialRequests");

const onSubmit = handleSubmit(async (values) => {
  await createBooking(values);
});
</script>

<template>
  <v-card title="Book a room">
    <v-card-text>
      <v-form @submit.prevent="onSubmit">
        <v-text-field v-model="guestName" label="Guest name" :error-messages="errors.guestName" />
        <v-text-field
          v-model="guestEmail"
          label="Guest email"
          type="email"
          :error-messages="errors.guestEmail"
        />

        <DateTimeField v-model="checkIn" label="Check-in" :error-messages="errors.checkIn" />
        <DateTimeField v-model="checkOut" label="Check-out" :error-messages="errors.checkOut" />

        <v-select
          v-model="roomType"
          :items="roomTypes"
          label="Room type"
          :error-messages="errors.roomType"
        />

        <v-row dense>
          <v-col cols="12" sm="6">
            <v-number-input v-model="adults" label="Adults" :error-messages="errors.adults" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-number-input v-model="children" label="Children" :error-messages="errors.children" />
          </v-col>
        </v-row>

        <v-textarea
          v-model="specialRequests"
          label="Special requests"
          rows="3"
          :error-messages="errors.specialRequests"
        />

        <v-btn type="submit" color="primary" :loading="isSubmitting">Book room</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
