<script setup lang="ts">
import { computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

import { createProfile, updateProfile } from "@/api/forms";
import type { ProfileInput } from "@/types/forms";
import { profileSchema } from "@/validation/profileSchema";

// Passing an id switches the form to edit mode.
const props = defineProps<{
  id?: number;
  initialValues?: ProfileInput;
}>();

const isEdit = computed(() => props.id !== undefined);

// Explicit type: vee-validate can't infer it from the schema when initialValues is also passed.
const { defineField, errors, handleSubmit, isSubmitting } = useForm<ProfileInput>({
  validationSchema: toTypedSchema(profileSchema),
  initialValues: {
    fullName: "",
    email: "",
    phone: "",
    age: null,
    dateOfBirth: null,
    website: "",
    ...props.initialValues,
  },
});

const [fullName] = defineField("fullName");
const [email] = defineField("email");
const [phone] = defineField("phone");
const [age] = defineField("age");
const [dateOfBirth] = defineField("dateOfBirth");
const [website] = defineField("website");

const onSubmit = handleSubmit(async (values) => {
  if (props.id !== undefined) await updateProfile(props.id, values);
  else await createProfile(values);
});
</script>

<template>
  <v-card :title="isEdit ? `Edit profile #${id}` : 'Create profile'">
    <v-card-text>
      <v-form @submit.prevent="onSubmit">
        <v-text-field v-model="fullName" label="Full name" :error-messages="errors.fullName" />
        <v-text-field v-model="email" label="Email" type="email" :error-messages="errors.email" />
        <v-text-field v-model="phone" label="Phone" type="tel" :error-messages="errors.phone" />

        <v-row dense>
          <v-col cols="12" sm="4">
            <v-number-input v-model="age" label="Age" :error-messages="errors.age" />
          </v-col>
          <v-col cols="12" sm="8">
            <v-date-input
              v-model="dateOfBirth"
              label="Date of birth"
              prepend-icon=""
              prepend-inner-icon="mdi-cake-variant"
              :error-messages="errors.dateOfBirth"
            />
          </v-col>
        </v-row>

        <v-text-field
          v-model="website"
          label="Website (optional)"
          type="url"
          :error-messages="errors.website"
        />

        <v-btn type="submit" color="primary" :loading="isSubmitting">
          {{ isEdit ? "Save changes" : "Create profile" }}
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
