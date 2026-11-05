<script setup lang="ts">
import { computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

import DateTimeField from "./DateTimeField.vue";
import { createEvent, updateEvent } from "@/api/forms";
import type { EventInput } from "@/types/forms";
import { eventSchema } from "@/validation/eventSchema";
import { vuetifyConfig } from "@/validation/vuetify";

// Passing an id switches the form to edit mode.
const props = defineProps<{
  id?: number;
  initialValues?: EventInput;
}>();

const isEdit = computed(() => props.id !== undefined);

// Explicit type: vee-validate can't infer it from the schema when initialValues is also passed.
const { defineField, handleSubmit, isSubmitting } = useForm<EventInput>({
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

const [title, titleAttrs] = defineField("title", vuetifyConfig);
const [description, descriptionAttrs] = defineField("description", vuetifyConfig);
const [organizerEmail, organizerEmailAttrs] = defineField("organizerEmail", vuetifyConfig);
const [capacity, capacityAttrs] = defineField("capacity", vuetifyConfig);
const [ticketPrice, ticketPriceAttrs] = defineField("ticketPrice", vuetifyConfig);
const [startsAt, startsAtAttrs] = defineField("startsAt", vuetifyConfig);
const [endsAt, endsAtAttrs] = defineField("endsAt", vuetifyConfig);

const onSubmit = handleSubmit(async (values) => {
  if (props.id !== undefined) await updateEvent(props.id, values);
  else await createEvent(values);
});
</script>

<template>
  <v-card :title="isEdit ? `Edit event #${id}` : 'Create event'">
    <v-card-text>
      <v-form @submit.prevent="onSubmit">
        <v-text-field v-model="title" v-bind="titleAttrs" label="Title" />
        <v-textarea v-model="description" v-bind="descriptionAttrs" label="Description" rows="3" />
        <v-text-field
          v-model="organizerEmail"
          v-bind="organizerEmailAttrs"
          label="Organizer email"
          type="email"
        />

        <v-row dense>
          <v-col cols="12" sm="6">
            <v-number-input v-model="capacity" v-bind="capacityAttrs" label="Capacity" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-number-input
              v-model="ticketPrice"
              v-bind="ticketPriceAttrs"
              label="Ticket price"
              :precision="2"
              :step="0.5"
            />
          </v-col>
        </v-row>

        <DateTimeField v-model="startsAt" v-bind="startsAtAttrs" label="Starts at" />
        <DateTimeField v-model="endsAt" v-bind="endsAtAttrs" label="Ends at" />

        <v-btn type="submit" color="primary" :loading="isSubmitting">
          {{ isEdit ? "Save changes" : "Create event" }}
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
