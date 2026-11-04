<script setup lang="ts">
import { computed, ref } from 'vue'

import DateTimeField from './DateTimeField.vue'
import { createEvent, updateEvent } from '@/api/forms'
import type { EventInput } from '@/types/forms'

// Passing an id switches the form to edit mode.
const props = defineProps<{
  id?: number
  initialValues?: EventInput
}>()

const isEdit = computed(() => props.id !== undefined)

const form = ref<EventInput>({
  title: '',
  description: '',
  organizerEmail: '',
  capacity: null,
  ticketPrice: null,
  startsAt: null,
  endsAt: null,
  ...props.initialValues,
})

const submitting = ref(false)

async function onSubmit() {
  submitting.value = true
  try {
    if (props.id !== undefined) await updateEvent(props.id, form.value)
    else await createEvent(form.value)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <v-card :title="isEdit ? `Edit event #${id}` : 'Create event'">
    <v-card-text>
      <v-form @submit.prevent="onSubmit">
        <v-text-field v-model="form.title" label="Title" />
        <v-textarea v-model="form.description" label="Description" rows="3" />
        <v-text-field v-model="form.organizerEmail" label="Organizer email" type="email" />

        <v-row dense>
          <v-col cols="12" sm="6">
            <v-number-input v-model="form.capacity" label="Capacity" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-number-input
              v-model="form.ticketPrice"
              label="Ticket price"
              :precision="2"
              :step="0.5"
            />
          </v-col>
        </v-row>

        <DateTimeField v-model="form.startsAt" label="Starts at" />
        <DateTimeField v-model="form.endsAt" label="Ends at" />

        <v-btn type="submit" color="primary" :loading="submitting">
          {{ isEdit ? 'Save changes' : 'Create event' }}
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
