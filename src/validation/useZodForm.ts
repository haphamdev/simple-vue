import { nextTick, ref, watch, type Ref } from 'vue'
import type { z } from 'zod'
import type { VForm } from 'vuetify/components'

type ObjectSchema = z.ZodType<Record<string, unknown>, Record<string, unknown>>

// What the form holds while editing: the schema's input, where any field may still be empty.
export type FormState<S extends ObjectSchema> = { [K in keyof z.input<S>]: z.input<S>[K] | null }

export function useZodForm<S extends ObjectSchema>(schema: S, initialValues: FormState<S>) {
  type Key = keyof FormState<S> & string

  const form = ref({ ...initialValues }) as Ref<FormState<S>>
  const formRef = ref<InstanceType<typeof VForm>>()
  const submitting = ref(false)

  // Rules always validate the whole form, so cross-field checks see every value.
  // Returns true when field has valid data, otherwise, returns the error message
  function validateField(key: Key): string | true {
    const result = schema.safeParse(form.value)
    if (result.success) return true
    return result.error.issues.find((issue) => issue.path[0] === key)?.message ?? true
  }

  const fieldProps = new Map<Key, { name: Key; rules: (() => string | true)[] }>()

  // Props for a Vuetify input: `<v-text-field v-model="form.title" v-bind="field('title')" />`
  function field(key: Key) {
    let props = fieldProps.get(key)
    if (!props) {
      props = { name: key, rules: [() => validateField(key)] }
      fieldProps.set(key, props)
    }
    return props
  }

  // Vuetify only re-runs a field's rules when that field changes. When a value changes, re-check
  // the other fields that have already been checked (`isValid !== null`), so e.g. "Ends at"
  // updates when "Starts at" changes. Untouched fields stay untouched.
  watch(
    () => ({ ...form.value }) as Record<string, unknown>,
    (next, prev) => {
      const changed = Object.keys(next).filter((key) => next[key] !== prev[key])
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

  // Validates every field, then hands the parsed (typed, transformed) values to `handler`.
  async function submit(handler: (data: z.output<S>) => Promise<unknown>) {
    if (!formRef.value || submitting.value) return

    const { valid } = await formRef.value.validate()
    if (!valid) return focusFirstInvalid()

    const result = schema.safeParse(form.value)
    if (!result.success) {
      // Only possible when a schema field has no input bound to it: a bug in the form, not the input.
      console.warn('[useZodForm] Errors on fields that are not on the form:', result.error.issues)
      return
    }

    submitting.value = true
    try {
      await handler(result.data)
    } finally {
      submitting.value = false
    }
  }

  return { form, formRef, field, submit, submitting }
}
