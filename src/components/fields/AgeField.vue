<script setup lang="ts">
// Look only. Validation (`rules`, `name`, `error-messages`) comes from the form and falls through.
withDefaults(defineProps<{ label?: string }>(), { label: 'Age' })

const model = defineModel<number | null>()
</script>

<template>
  <v-number-input v-model="model" :label suffix="years" />
</template>
