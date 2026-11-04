<script setup lang="ts">
import { computed, ref, watch } from 'vue'

// `rules`, `name` and `error-messages` fall through to the root v-input, which validates the
// combined value and shows a single message below both pickers.
defineProps<{ label: string }>()

// Combined value: only set once both a date and a time are picked.
const model = defineModel<Date | null>({ default: null })

const date = ref<Date | null>(null)
const time = ref<string | null>(null)
const dateMenu = ref(false)
const timeMenu = ref(false)
const hasFocusWithin = ref(false)

// The pickers open in overlays outside this element, so an open menu also counts as focused.
// When this turns false, the v-input runs its blur validation.
const isFocused = computed(() => hasFocusWithin.value || dateMenu.value || timeMenu.value)

function onFocusOut(event: FocusEvent) {
  const wrapper = event.currentTarget as HTMLElement
  if (!wrapper.contains(event.relatedTarget as Node | null)) hasFocusWithin.value = false
}

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
  <v-input :model-value="model" :focused="isFocused">
    <template #default="{ isValid }">
      <div class="w-100" @focusin="hasFocusWithin = true" @focusout="onFocusOut">
        <v-row dense>
          <v-col cols="12" sm="7">
            <v-date-input
              v-model="date"
              v-model:menu="dateMenu"
              :label="`${label} (date)`"
              :error="isValid.value === false"
              hide-details
              prepend-icon=""
              prepend-inner-icon="mdi-calendar"
            />
          </v-col>
          <v-col cols="12" sm="5">
            <v-menu v-model="timeMenu" :close-on-content-click="false">
              <template #activator="{ props: activatorProps }">
                <v-text-field
                  v-bind="activatorProps"
                  :model-value="time"
                  :label="`${label} (time)`"
                  :error="isValid.value === false"
                  hide-details
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
  </v-input>
</template>
