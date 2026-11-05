<script setup lang="ts">
import { computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

import DateTimeField from "./DateTimeField.vue";
import { createEvent, updateEvent } from "@/api/forms";
import type { EventInput } from "@/types/forms";
import { eventSchema } from "@/validation/eventSchema";

// Passing an id switches the form to edit mode.
const props = defineProps<{
  id?: number;
  initialValues?: EventInput;
}>();

const isEdit = computed(() => props.id !== undefined);

// Explicit type: vee-validate can't infer it from the schema when initialValues is also passed.
const { defineField, errors, handleSubmit, isSubmitting } = useForm<EventInput>({
  validationSchema: toTypedSchema(eventSchema),
  initialValues: {
    title: "",
    description: "",
    organizerEmail: "",
    capacity: null,
    ticketPrice: null,
    startsAt: null,
    endsAt: null,
    ...props.initialValues,
  },
});

const [title] = defineField("title");
const [description] = defineField("description");
const [organizerEmail] = defineField("organizerEmail");
const [capacity] = defineField("capacity");
const [ticketPrice] = defineField("ticketPrice");
const [startsAt] = defineField("startsAt");
const [endsAt] = defineField("endsAt");

const onSubmit = handleSubmit(async (values) => {
  if (props.id !== undefined) await updateEvent(props.id, values);
  else await createEvent(values);
});
</script>

<template>
  <v-card :title="isEdit ? `Edit event #${id}` : 'Create event'">
    <v-card-text>
      <v-form @submit.prevent="onSubmit">
        <v-text-field v-model="title" label="Title" :error-messages="errors.title" />
        <v-textarea
          v-model="description"
          label="Description"
          rows="3"
          :error-messages="errors.description"
        />
        <v-text-field
          v-model="organizerEmail"
          label="Organizer email"
          type="email"
          :error-messages="errors.organizerEmail"
        />

        <v-row dense>
          <v-col cols="12" sm="6">
            <v-number-input v-model="capacity" label="Capacity" :error-messages="errors.capacity" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-number-input
              v-model="ticketPrice"
              label="Ticket price"
              :precision="2"
              :step="0.5"
              :error-messages="errors.ticketPrice"
            />
          </v-col>
        </v-row>

        <DateTimeField v-model="startsAt" label="Starts at" :error-messages="errors.startsAt" />
        <DateTimeField v-model="endsAt" label="Ends at" :error-messages="errors.endsAt" />

        <v-btn type="submit" color="primary" :loading="isSubmitting">
          {{ isEdit ? "Save changes" : "Create event" }}
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
