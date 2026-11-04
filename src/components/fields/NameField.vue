<script setup lang="ts">
// Look only. Validation (`rules`, `name`, `error-messages`) comes from the form and falls through.
withDefaults(defineProps<{ label?: string }>(), { label: 'Full name' })

const model = defineModel<string | null>()
</script>

<template>
  <v-text-field v-model="model" :label autocomplete="name" prepend-inner-icon="mdi-account" />
</template>
