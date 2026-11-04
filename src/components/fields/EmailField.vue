<script setup lang="ts">
// Look only. Validation (`rules`, `name`, `error-messages`) comes from the form and falls through.
withDefaults(defineProps<{ label?: string }>(), { label: 'Email' })

const model = defineModel<string | null>()
</script>

<template>
  <v-text-field
    v-model="model"
    :label
    type="email"
    autocomplete="email"
    prepend-inner-icon="mdi-email-outline"
  />
</template>
