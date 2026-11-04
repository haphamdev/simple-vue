<script setup lang="ts">
import DateTimeField from './DateTimeField.vue'
import EmailField from './fields/EmailField.vue'
import { createEvent, updateEvent } from '@/api/forms'
import { createEventSchema, editEventSchema, type EventFormValues } from '@/schemas/event'
import { useZodForm } from '@/validation/useZodForm'

// Passing an id switches the form to edit mode.
const props = defineProps<{
  id?: number
  initialValues?: EventFormValues
}>()

const isEdit = props.id !== undefined

const { form, formRef, field, submit, submitting } = useZodForm(
  isEdit ? editEventSchema : createEventSchema,
  {
    title: '',
    description: '',
    organizerEmail: '',
    capacity: null,
    ticketPrice: null,
    startsAt: null,
    endsAt: null,
    ...props.initialValues,
  },
)

function onSubmit() {
  return submit((data) =>
    props.id !== undefined ? updateEvent(props.id, data) : createEvent(data),
  )
}
</script>

<template>
  <v-card :title="isEdit ? `Edit event #${id}` : 'Create event'">
    <v-card-text>
      <v-form ref="formRef" @submit.prevent="onSubmit">
        <v-text-field v-model="form.title" label="Title" v-bind="field('title')" />
        <v-textarea
          v-model="form.description"
          label="Description"
          rows="3"
          v-bind="field('description')"
        />
        <EmailField
          v-model="form.organizerEmail"
          label="Organizer email"
          v-bind="field('organizerEmail')"
        />

        <v-row dense>
          <v-col cols="12" sm="6">
            <v-number-input v-model="form.capacity" label="Capacity" v-bind="field('capacity')" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-number-input
              v-model="form.ticketPrice"
              label="Ticket price"
              :precision="2"
              :step="0.5"
              v-bind="field('ticketPrice')"
            />
          </v-col>
        </v-row>

        <DateTimeField v-model="form.startsAt" label="Starts at" v-bind="field('startsAt')" />
        <DateTimeField v-model="form.endsAt" label="Ends at" v-bind="field('endsAt')" />

        <v-btn type="submit" color="primary" :loading="submitting">
          {{ isEdit ? 'Save changes' : 'Create event' }}
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
