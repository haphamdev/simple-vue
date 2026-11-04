<script setup lang="ts">
import { ref } from "vue";

import AgeField from "./fields/AgeField.vue";
import EmailField from "./fields/EmailField.vue";
import NameField from "./fields/NameField.vue";
import { createProfile, updateProfile } from "@/api/forms";
import { profileSchema, type ProfileFormValues } from "@/schemas/profile";
import { useZodForm } from "@/validation/useZodForm";

// Passing an id switches the form to edit mode.
const props = defineProps<{
  id?: number;
  initialValues?: ProfileFormValues;
}>();

const isEdit = props.id !== undefined;

const { form, formRef, field, submit, submitting, formError } = useZodForm(profileSchema, {
  fullName: "",
  email: "",
  phone: "",
  age: null,
  dateOfBirth: null,
  website: "",
  ...props.initialValues,
});

const saved = ref(false);

async function onSubmit() {
  saved.value = await submit((data) =>
    props.id !== undefined ? updateProfile(props.id, data) : createProfile(data),
  );
}
</script>

<template>
  <v-card :title="isEdit ? `Edit profile #${id}` : 'Create profile'">
    <v-card-text>
      <v-form ref="formRef" @submit.prevent="onSubmit">
        <v-alert v-if="formError" type="error" variant="tonal" class="mb-4" :text="formError" />
        <NameField v-model="form.fullName" v-bind="field('fullName')" />
        <EmailField v-model="form.email" v-bind="field('email')" />
        <v-text-field
          v-model="form.phone"
          label="Phone"
          type="tel"
          autocomplete="tel"
          v-bind="field('phone')"
        />

        <v-row dense>
          <v-col cols="12" sm="4">
            <AgeField v-model="form.age" v-bind="field('age')" />
          </v-col>
          <v-col cols="12" sm="8">
            <v-date-input
              v-model="form.dateOfBirth"
              label="Date of birth"
              prepend-icon=""
              prepend-inner-icon="mdi-cake-variant"
              v-bind="field('dateOfBirth')"
            />
          </v-col>
        </v-row>

        <v-text-field
          v-model="form.website"
          label="Website (optional)"
          type="url"
          v-bind="field('website')"
        />

        <v-btn type="submit" color="primary" :loading="submitting">
          {{ isEdit ? "Save changes" : "Create profile" }}
        </v-btn>
      </v-form>
    </v-card-text>
    <v-snackbar
      v-model="saved"
      color="success"
      :timeout="3000"
      :text="isEdit ? 'Profile saved' : 'Profile created'"
    />
  </v-card>
</template>
