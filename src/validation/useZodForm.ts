import { nextTick, ref, watch, type Ref } from 'vue'
import type { z } from 'zod'
import type { VForm } from 'vuetify/components'

import { t } from './messages'
import { ApiError } from '@/api/ApiError'

type ObjectSchema = z.ZodType<Record<string, unknown>, Record<string, unknown>>

// What the form holds while editing: the schema's input, where any field may still be empty.
export type FormState<S extends ObjectSchema> = { [K in keyof z.input<S>]: z.input<S>[K] | null }

export function useZodForm<S extends ObjectSchema>(schema: S, initialValues: FormState<S>) {
  type Key = keyof FormState<S> & string

  const form = ref({ ...initialValues }) as Ref<FormState<S>>
  const formRef = ref<InstanceType<typeof VForm>>()
  const submitting = ref(false)
  // Backend errors: per-field messages from a 422, and anything else for an alert above the form.
  const serverErrors = ref<Record<string, string[]>>({})
  const formError = ref<string | null>(null)

  // Rules always validate the whole form, so cross-field checks see every value.
  // Returns true when field has valid data, otherwise, returns the error message
  function validateField(key: Key): string | true {
    const result = schema.safeParse(form.value)
    if (result.success) return true
    return result.error.issues.find((issue) => issue.path[0] === key)?.message ?? true
  }

  // Rules are created once per field, so Vuetify sees the same array on every render.
  const fieldRules = new Map<Key, (() => string | true)[]>()

  // Props for a Vuetify input: `<v-text-field v-model="form.title" v-bind="field('title')" />`
  function field(key: Key) {
    let rules = fieldRules.get(key)
    if (!rules) {
      rules = [() => validateField(key)]
      fieldRules.set(key, rules)
    }
    return { name: key, rules, errorMessages: serverErrors.value[key] ?? [] }
  }

  // Vuetify only re-runs a field's rules when that field changes. When a value changes, re-check
  // the other fields that have already been checked (`isValid !== null`), so e.g. "Ends at"
  // updates when "Starts at" changes. Untouched fields stay untouched.
  // A changed field also drops its backend error: it was about the old value.
  watch(
    () => ({ ...form.value }) as Record<string, unknown>,
    (next, prev) => {
      const changed = Object.keys(next).filter((key) => next[key] !== prev[key])
      for (const key of changed) delete serverErrors.value[key]
      for (const item of formRef.value?.items ?? []) {
        if (item.isValid !== null && !changed.includes(String(item.id))) item.validate()
      }
    },
  )

  async function focusFirstInvalid() {
    await nextTick()
    const el: HTMLElement | undefined = formRef.value?.$el
    el?.querySelector<HTMLElement>(
      '.v-input--error input:not([type="hidden"]), .v-input--error textarea',
    )?.focus()
  }

  // 422 errors go under their fields; errors for keys the form doesn't have, and any other
  // failure, go to `formError`.
  function showServerError(error: unknown) {
    if (error instanceof ApiError && error.status === 422) {
      const fieldErrors: Record<string, string[]> = {}
      const otherErrors: string[] = []
      for (const [key, messages] of Object.entries(error.errors)) {
        if (key in form.value) fieldErrors[key] = messages
        else otherErrors.push(...messages)
      }
      serverErrors.value = fieldErrors
      // With nothing else to show, fall back to the response's general message.
      if (otherErrors.length) formError.value = otherErrors.join(' ')
      else if (!Object.keys(fieldErrors).length) formError.value = error.message
      return focusFirstInvalid()
    }

    console.error(error)
    formError.value =
      error instanceof ApiError ? error.message : t('Something went wrong. Please try again.')
  }

  // Validates every field, then hands the parsed (typed, transformed) values to `handler`.
  // Resolves to true when the handler succeeded.
  async function submit(handler: (data: z.output<S>) => Promise<unknown>): Promise<boolean> {
    if (!formRef.value || submitting.value) return false

    formError.value = null
    const { valid } = await formRef.value.validate()
    if (!valid) {
      await focusFirstInvalid()
      return false
    }

    const result = schema.safeParse(form.value)
    if (!result.success) {
      // Only possible when a schema field has no input bound to it: a bug in the form, not the input.
      console.warn('[useZodForm] Errors on fields that are not on the form:', result.error.issues)
      return false
    }

    submitting.value = true
    try {
      await handler(result.data)
      return true
    } catch (error) {
      await showServerError(error)
      return false
    } finally {
      submitting.value = false
    }
  }

  return { form, formRef, field, submit, submitting, formError }
}
