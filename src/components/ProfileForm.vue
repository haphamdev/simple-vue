<script setup lang="ts">
import { computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

import { createProfile, updateProfile } from "@/api/forms";
import type { ProfileInput } from "@/types/forms";
import { profileSchema } from "@/validation/profileSchema";
import { vuetifyConfig } from "@/validation/vuetify";

// Passing an id switches the form to edit mode.
const props = defineProps<{
  id?: number;
  initialValues?: ProfileInput;
}>();

const isEdit = computed(() => props.id !== undefined);

// Explicit type: vee-validate can't infer it from the schema when initialValues is also passed.
const { defineField, handleSubmit, isSubmitting } = useForm<ProfileInput>({
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

const [fullName, fullNameAttrs] = defineField("fullName", vuetifyConfig);
const [email, emailAttrs] = defineField("email", vuetifyConfig);
const [phone, phoneAttrs] = defineField("phone", vuetifyConfig);
const [age, ageAttrs] = defineField("age", vuetifyConfig);
const [dateOfBirth, dateOfBirthAttrs] = defineField("dateOfBirth", vuetifyConfig);
const [website, websiteAttrs] = defineField("website", vuetifyConfig);

const onSubmit = handleSubmit(async (values) => {
  if (props.id !== undefined) await updateProfile(props.id, values);
  else await createProfile(values);
});
</script>

<template>
  <v-card :title="isEdit ? `Edit profile #${id}` : 'Create profile'">
    <v-card-text>
      <v-form @submit.prevent="onSubmit">
        <v-text-field v-model="fullName" v-bind="fullNameAttrs" label="Full name" />
        <v-text-field v-model="email" v-bind="emailAttrs" label="Email" type="email" />
        <v-text-field v-model="phone" v-bind="phoneAttrs" label="Phone" type="tel" />

        <v-row dense>
          <v-col cols="12" sm="4">
            <v-number-input v-model="age" v-bind="ageAttrs" label="Age" />
          </v-col>
          <v-col cols="12" sm="8">
            <v-date-input
              v-model="dateOfBirth"
              v-bind="dateOfBirthAttrs"
              label="Date of birth"
              prepend-icon=""
              prepend-inner-icon="mdi-cake-variant"
            />
          </v-col>
        </v-row>

        <v-text-field
          v-model="website"
          v-bind="websiteAttrs"
          label="Website (optional)"
          type="url"
        />

        <v-btn type="submit" color="primary" :loading="isSubmitting">
          {{ isEdit ? "Save changes" : "Create profile" }}
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
