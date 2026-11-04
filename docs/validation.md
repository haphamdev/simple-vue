# Form validation with Zod and Vuetify

Each form has one Zod schema. The schema decides what is valid, and the form's types are taken from it.
Vuetify's own validation (`v-form`, `:rules`) shows the errors. A small composable, `useZodForm`, connects the two.

## How it behaves

- Nothing is checked when the page loads.
- A field is checked when the user leaves it. Once it shows an error, it is re-checked as they type, so the error clears as soon as it's fixed.
- Submit checks every field, marks the invalid ones red and focuses the first one. The button is only blocked while the request is in flight.
- Rules that compare fields (e.g. "end after start") show their error under one field. That field is re-checked automatically when the other one changes.
- Backend errors: a 422 response's `errors` show under the matching fields and disappear when the field is edited. Anything else shows in an alert at the top of the form.

## Where things are

```
src/validation/
  messages.ts      t(key, params): English text is the translation key; swap for vue-i18n later
  errorMap.ts      global Zod config: Zod's built-in errors → our messages (installed in main.ts)
  fields.ts        shared field rules: requiredText, email, phone, optionalUrl, integer, money, dates…
  refinements.ts   shared rules comparing fields: endAfter, maxDuration, sumAtMost, ageMatchesBirthDate
  useZodForm.ts    connects a schema to a v-form
src/schemas/       one file per form: schema + its types
src/components/fields/   NameField, EmailField, AgeField: look only, no rules
src/components/DateTimeField.vue   date + time pickers combined into one value
src/plugins/vuetify.ts   sets validate-on="blur invalid-input lazy" for every v-form
src/api/ApiError.ts      backend error shape (status, message, errors per field)
```

## Using it in a form

```vue
<script setup lang="ts">
const { form, formRef, field, submit, submitting, formError } = useZodForm(eventSchema, {
  title: '',
  capacity: null,
  // …every field, with its starting value
})

const saved = ref(false)
async function onSubmit() {
  saved.value = await submit(createEvent) // createEvent receives parsed, typed data
}
</script>

<template>
  <v-form ref="formRef" @submit.prevent="onSubmit">
    <v-alert v-if="formError" type="error" variant="tonal" :text="formError" />
    <v-text-field v-model="form.title" label="Title" v-bind="field('title')" />
    <v-number-input v-model="form.capacity" label="Capacity" v-bind="field('capacity')" />
    <v-btn type="submit" :loading="submitting">Save</v-btn>
  </v-form>
</template>
```

`field('title')` returns `name`, `rules` and `errorMessages` (backend errors). Every input needs it, or that field is never checked.

## Adding things

**A field rule.** Add a function to `fields.ts` that returns a Zod schema. Rely on `errorMap.ts` for standard messages. Pass `{ error: () => t('…') }` only for a message specific to this rule. Use a function, not a plain string, so the text is translated when the check runs.

**A rule comparing fields.** Add it to `refinements.ts` using `z.refine` or `z.superRefine` with:
- `path: [targetKey]`, the field the error shows under, and
- `when: whenValid([...keysItReads])`. Without `when`, Zod skips the rule whenever *any* field in the form is invalid.

**A form.**
1. Create `src/schemas/<name>.ts`: `z.object({...})` built from `fields.ts`, then `.check(...)` for rules comparing fields.
2. Export `<Name>FormValues = FormState<typeof schema>` (the values while editing) and `<Name>Payload = z.output<typeof schema>` (what's sent to the API).
3. In the component, call `useZodForm(schema, initialValues)` and add `v-bind="field('key')"` to every input.

**Different create and edit rules.** Make two constants from one plain object: `base.check(...)` and `base.extend({ key: stricterRule }).check(...)`. Call `.extend()` *before* `.check()`; Zod refuses to extend a schema that already has checks (see `schemas/event.ts`).

**A shared field component.** Keep it to looks only (label, icon, `type`, `autocomplete`). Don't put rules in it. `rules`, `name` and `error-messages` pass through from `v-bind="field(...)"`, as long as the Vuetify input is the component's root element.

**A component that combines several inputs** (like `DateTimeField`). Make a `v-input` the root, so the validation props apply to the combined value. Show the inner inputs with `hide-details` and `:error="isValid.value === false"` from the `v-input` slot.

## Porting to a JavaScript project

Nothing here depends on TypeScript.

- Rename the files to `.js` and remove the type annotations (`<S extends ...>`, `: string`, `as Ref<...>`, the `type ...` lines). The code that runs is the same.
- In `refinements.ts`, remove the `ParsePayload` type and the generic `<T>`. The functions work the same.
- For editor autocomplete without TypeScript, add JSDoc types next to each schema:

  ```js
  /** @typedef {import('zod').input<typeof eventSchema>} EventFormValues */
  /** @typedef {import('zod').output<typeof eventSchema>} EventPayload */
  ```

  Unlike `FormState`, `z.input` doesn't allow `null` in each field. That only matters if JS type checking is strict.
  Use them as `/** @param {EventPayload} data */`. Make sure `checkJs` or the editor's JS type checking is on to see them.
- When you migrate to TypeScript later, the types already come from the schemas, so the validation code needs no redesign.

## Switching to vue-i18n

`t()` in `messages.ts` is the only place messages are turned into text. Replace its body with vue-i18n's `i18n.global.t(key, params)`. The `{name}` placeholders already use vue-i18n's syntax.

Things to check when doing this:

- vue-i18n can read a dot in a key as a nested path. Test a key containing a dot, such as "Something went wrong. Please try again.", or remove dots from keys.
- In vue-i18n messages, `@` and `|` have special meanings (linked messages, plurals). Avoid them in message text.

## Vuetify details this relies on (Vuetify 4)

- `validate-on="blur invalid-input lazy"`: with `lazy`, a field that hasn't been checked has `isValid === null`. `useZodForm` uses this to re-check only fields that have already been checked.
- `v-form`'s ref exposes `items` (`id` = the input's `name`, `isValid`, `validate()`) and `validate()`.
- Changing a field's `rules` doesn't re-run them. That's why `useZodForm` watches the form values and re-checks dependent fields itself.
