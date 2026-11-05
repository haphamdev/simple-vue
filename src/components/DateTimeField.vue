<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'

defineProps<{ label: string; errorMessages?: string | string[] }>()

// Emitted once focus leaves the whole field (date + time), not when moving between its parts.
const emit = defineEmits<{ blur: [] }>()

// Combined value: only set once both a date and a time are picked.
const model = defineModel<Date | null>({ default: null })

const date = ref<Date | null>(null)
const time = ref<string | null>(null)
const timeMenu = ref(false)
const root = useTemplateRef<HTMLElement>('root')

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function combine(): Date | null {
  if (!date.value || !time.value) return null
  const [hours = 0, minutes = 0] = time.value.split(':').map(Number)
  const result = new Date(date.value)
  result.setHours(hours, minutes, 0, 0)
  return result
}

function isInside(node: EventTarget | Element | null) {
  return node instanceof Node && !!root.value?.contains(node)
}

// The time picker menu is teleported outside the root, so ignore focus moving into it.
function onFocusOut(event: FocusEvent) {
  if (timeMenu.value || isInside(event.relatedTarget)) return
  emit('blur')
}

watch(timeMenu, (open) => {
  if (!open && !isInside(document.activeElement)) emit('blur')
})

watch(
  model,
  (value) => {
    if (!value) return
    date.value = new Date(value.getFullYear(), value.getMonth(), value.getDate())
    time.value = `${pad(value.getHours())}:${pad(value.getMinutes())}`
  },
  { immediate: true },
)

watch([date, time], () => {
  const combined = combine()
  if (combined?.getTime() !== model.value?.getTime()) model.value = combined
})
</script>

<template>
  <div ref="root" @focusout="onFocusOut">
    <v-row dense>
      <v-col cols="12" sm="7">
        <v-date-input
          v-model="date"
          :label="`${label} (date)`"
          prepend-icon=""
          prepend-inner-icon="mdi-calendar"
          :error-messages="errorMessages"
        />
      </v-col>
      <v-col cols="12" sm="5">
        <v-menu v-model="timeMenu" :close-on-content-click="false">
          <template #activator="{ props: activatorProps }">
            <v-text-field
              v-bind="activatorProps"
              :model-value="time"
              :label="`${label} (time)`"
              prepend-inner-icon="mdi-clock-outline"
              readonly
            />
          </template>
          <v-time-picker v-model="time" format="24hr" />
        </v-menu>
      </v-col>
    </v-row>
  </div>
</template>
