<script setup lang="ts">
import { computed, ref } from 'vue'

import { createProfile, updateProfile } from '@/api/forms'
import type { ProfileInput } from '@/types/forms'

// Passing an id switches the form to edit mode.
const props = defineProps<{
  id?: number
  initialValues?: ProfileInput
}>()

const isEdit = computed(() => props.id !== undefined)

const form = ref<ProfileInput>({
  fullName: '',
  email: '',
  phone: '',
  age: null,
  dateOfBirth: null,
  website: '',
  ...props.initialValues,
})

const submitting = ref(false)

async function onSubmit() {
  submitting.value = true
  try {
    if (props.id !== undefined) await updateProfile(props.id, form.value)
    else await createProfile(form.value)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <v-card :title="isEdit ? `Edit profile #${id}` : 'Create profile'">
    <v-card-text>
      <v-form @submit.prevent="onSubmit">
        <v-text-field v-model="form.fullName" label="Full name" />
        <v-text-field v-model="form.email" label="Email" type="email" />
        <v-text-field v-model="form.phone" label="Phone" type="tel" />

        <v-row dense>
          <v-col cols="12" sm="4">
            <v-number-input v-model="form.age" label="Age" />
          </v-col>
          <v-col cols="12" sm="8">
            <v-date-input
              v-model="form.dateOfBirth"
              label="Date of birth"
              prepend-icon=""
              prepend-inner-icon="mdi-cake-variant"
            />
          </v-col>
        </v-row>

        <v-text-field v-model="form.website" label="Website (optional)" type="url" />

        <v-btn type="submit" color="primary" :loading="submitting">
          {{ isEdit ? 'Save changes' : 'Create profile' }}
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
