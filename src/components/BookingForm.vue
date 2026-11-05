<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

import DateTimeField from "./DateTimeField.vue";
import { createBooking } from "@/api/forms";
import type { BookingInput, RoomType } from "@/types/forms";
import { bookingSchema, roomCapacity } from "@/validation/bookingSchema";
import { vuetifyConfig } from "@/validation/vuetify";

const roomTypes: { title: string; value: RoomType }[] = [
  { title: `Single (${roomCapacity.single} guest)`, value: "single" },
  { title: `Double (${roomCapacity.double} guests)`, value: "double" },
  { title: `Family (${roomCapacity.family} guests)`, value: "family" },
];

// Explicit type: vee-validate can't infer it from the schema when initialValues is also passed.
const { defineField, handleSubmit, isSubmitting } = useForm<BookingInput>({
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

const [guestName, guestNameAttrs] = defineField("guestName", vuetifyConfig);
const [guestEmail, guestEmailAttrs] = defineField("guestEmail", vuetifyConfig);
const [checkIn, checkInAttrs] = defineField("checkIn", vuetifyConfig);
const [checkOut, checkOutAttrs] = defineField("checkOut", vuetifyConfig);
const [adults, adultsAttrs] = defineField("adults", vuetifyConfig);
const [children, childrenAttrs] = defineField("children", vuetifyConfig);
const [roomType, roomTypeAttrs] = defineField("roomType", vuetifyConfig);
const [specialRequests, specialRequestsAttrs] = defineField("specialRequests", vuetifyConfig);

const onSubmit = handleSubmit(async (values) => {
  await createBooking(values);
});
</script>

<template>
  <v-card title="Book a room">
    <v-card-text>
      <v-form @submit.prevent="onSubmit">
        <v-text-field v-model="guestName" v-bind="guestNameAttrs" label="Guest name" />
        <v-text-field
          v-model="guestEmail"
          v-bind="guestEmailAttrs"
          label="Guest email"
          type="email"
        />

        <DateTimeField v-model="checkIn" v-bind="checkInAttrs" label="Check-in" />
        <DateTimeField v-model="checkOut" v-bind="checkOutAttrs" label="Check-out" />

        <v-select v-model="roomType" v-bind="roomTypeAttrs" :items="roomTypes" label="Room type" />

        <v-row dense>
          <v-col cols="12" sm="6">
            <v-number-input v-model="adults" v-bind="adultsAttrs" label="Adults" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-number-input v-model="children" v-bind="childrenAttrs" label="Children" />
          </v-col>
        </v-row>

        <v-textarea
          v-model="specialRequests"
          v-bind="specialRequestsAttrs"
          label="Special requests"
          rows="3"
        />

        <v-btn type="submit" color="primary" :loading="isSubmitting">Book room</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
