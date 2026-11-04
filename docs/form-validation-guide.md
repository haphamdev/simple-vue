# Form validation guide

How to add validation to a form, step by step. For how the approach works behind the scenes, see [validation.md](validation.md).

## 1. Checklist

To validate a new form:

1. **Write the schema** in `src/schemas/<form>.ts`. See [Define the schema](#2-define-the-schema).
2. **Export its two types**, `<Form>FormValues` and `<Form>Payload`. See [Define the schema](#2-define-the-schema).
3. **Call `useZodForm`** in the form component. See [Use the schema in a component](#5-use-the-schema-in-a-component).
4. **Add `v-bind="field('key')"` to every input.** A field without it is never checked.
5. **Show `formError`** in an alert at the top of the form. See [Server-side validation](#7-server-side-validation).

If fields depend on each other, also see [Cross-field validation](#3-cross-field-validation). If create and edit need different rules, see [Different rules for create and edit](#4-different-rules-for-create-and-edit).

## 2. Define the schema

Create one file per form in `src/schemas/`. Build each field from the shared rules in `src/validation/fields.ts`, then export two types.

```ts
// src/schemas/guest.ts
import { z } from 'zod'

import { email, integer, requiredText } from '@/validation/fields'
import type { FormState } from '@/validation/useZodForm'

export const guestSchema = z.object({
  name: requiredText({ max: 100 }),
  email: email(),
  age: integer({ min: 0, max: 130 }),
})

// Values held by the form while the user edits: any field may still be empty (null).
export type GuestFormValues = FormState<typeof guestSchema>
// Data sent to the API after validation passes: no nulls, text trimmed.
export type GuestPayload = z.output<typeof guestSchema>
```

Use the same field names as the API. Backend errors are matched to fields by name (see [Server-side validation](#7-server-side-validation)).

**Shared rules** in `src/validation/fields.ts`:

- `requiredText({ max })`, `optionalText({ max })`
  - Use for: text, required or optional; trimmed
- `email()`, `phone()`
  - Use for: a required email address or phone number
- `optionalUrl()`
  - Use for: an optional http(s) link; empty becomes `null`
- `integer({ min, max })`
  - Use for: whole numbers
- `money({ min })`
  - Use for: amounts with at most 2 decimal places
- `requiredDateTime()`, `futureDateTime()`, `pastDate()`
  - Use for: dates; any date, a date in the future, or a date in the past

If a rule is needed in more than one form, add it to `fields.ts` instead of writing it in the schema.

**Messages.** Standard messages ("This field is required", "Must be at most 100 characters", …) are added automatically. Only add a message for wording specific to one rule, and write it as a function:

```ts
code: requiredText().regex(/^[A-Z]{3}$/, { error: () => t('Use 3 capital letters') }),
```

A function, not a plain string, makes the text get translated each time the check runs (see [Messages and translation](#8-messages-and-translation)).

Reference: `src/schemas/profile.ts`.

## 3. Cross-field validation

For rules involving more than one field, add `.check(...)` after `z.object(...)`, using a rule from `src/validation/refinements.ts`.

```ts
export const staySchema = z
  .object({
    checkIn: futureDateTime(),
    checkOut: requiredDateTime(),
  })
  .check(endAfter('checkIn', 'checkOut', 'Check-out must be after check-in'))
```

The error shows under one field, here Check-out. That field is re-checked automatically when the other one changes, so the error clears when the user fixes either field.

**Shared rules** in `src/validation/refinements.ts`. The last argument, the message, is optional:

- `endAfter(startKey, endKey, message)`
  - Use for: an end date after a start date; error under `endKey`
- `maxDuration(startKey, endKey, days, message)`
  - Use for: a limit on the time between two dates; error under `endKey`
- `sumAtMost(keys, limit, targetKey, message)`
  - Use for: a total of several fields that can't exceed a limit; error under `targetKey`
- `ageMatchesBirthDate(ageKey, birthDateKey, message)`
  - Use for: an age that must match a date of birth; error under `ageKey`

**Writing a new rule.** Add it to `refinements.ts`, even if only one form uses it, so it can use the `whenValid` and `message` helpers there:

```ts
export function sameAs<T extends object>(
  key: keyof T & string,
  otherKey: keyof T & string,
  errorMessage = 'Does not match',
) {
  return z.refine<T>((value) => value[key] === value[otherKey], {
    path: [key], // the field the error shows under
    when: whenValid([key, otherKey]), // run once these two fields are valid
    error: message(errorMessage),
  })
}
```

Always set `when`. Without it, Zod skips the rule whenever _any_ field in the form is invalid, so the error doesn't appear until the whole form is otherwise correct.

Reference: `src/schemas/booking.ts`, `src/validation/refinements.ts`.

## 4. Different rules for create and edit

Build both from one plain `z.object`, and override fields with `.extend()` _before_ adding `.check()`. Zod throws an error the other way round.

```ts
const eventFields = z.object({ startsAt: requiredDateTime(), endsAt: requiredDateTime() })

export const editEventSchema = eventFields.check(endAfter('startsAt', 'endsAt'))
export const createEventSchema = eventFields
  .extend({ startsAt: futureDateTime() })
  .check(endAfter('startsAt', 'endsAt'))
```

Reference: `src/schemas/event.ts`.

## 5. Use the schema in a component

```vue
<script setup lang="ts">
import { ref } from 'vue'

import { createGuest } from '@/api/forms'
import { guestSchema } from '@/schemas/guest'
import { useZodForm } from '@/validation/useZodForm'

const { form, formRef, field, submit, submitting, formError } = useZodForm(guestSchema, {
  name: '',
  email: '',
  age: null,
})

const saved = ref(false)

async function onSubmit() {
  saved.value = await submit(createGuest)
}
</script>

<template>
  <v-form ref="formRef" @submit.prevent="onSubmit">
    <v-alert v-if="formError" type="error" variant="tonal" :text="formError" />
    <v-text-field v-model="form.name" label="Name" v-bind="field('name')" />
    <v-text-field v-model="form.email" label="Email" v-bind="field('email')" />
    <v-number-input v-model="form.age" label="Age" v-bind="field('age')" />
    <v-btn type="submit" :loading="submitting">Save</v-btn>
  </v-form>
  <v-snackbar v-model="saved" color="success" text="Guest saved" />
</template>
```

- Give every field a starting value: `''` for text, `null` for numbers, dates and selects.
- Put `ref="formRef"` on the `v-form`, and `v-bind="field('key')"` on every input.
- `submit(apiFn)` checks every field and focuses the first invalid one. If all are valid, it calls `apiFn` with the payload and returns `true` when the request succeeds.
- For an edit form, add the loaded values last: `{ name: '', ..., ...props.initialValues }`.

Reference: `src/components/BookingForm.vue`, `src/components/EventForm.vue` (edit mode).

## 6. Reusable field components

`src/components/fields/` has `NameField`, `EmailField`, `AgeField` and `DateTimeField`. Bind them like any Vuetify input:

```vue
<EmailField v-model="form.email" label="Guest email" v-bind="field('email')" />
```

To add a new one:

- Keep it to looks only (label, icon, `type`, `autocomplete`). Rules stay in the schema.
- Make the Vuetify input the root element, so `v-bind="field(...)"` passes through to it.
- To combine several inputs into one value, wrap them in a `v-input`, as `DateTimeField` does.

Reference: `src/components/fields/EmailField.vue`, `src/components/fields/DateTimeField.vue`.

## 7. Server-side validation

API functions throw an `ApiError(status, message, errors)` when a request fails. `submit()` catches it:

- **422 with `errors`** (Laravel style, `{ email: ['Already in use.'] }`): each error shows under the field with the same name and clears when the user edits that field. Keys the form doesn't have go to the alert.
- **Anything else** (500, network error): `message` shows in the `formError` alert.

With a real HTTP client, convert error responses into `ApiError` in one place, e.g. an axios interceptor:

```ts
http.interceptors.response.use(undefined, (error) => {
  const { status = 0, data } = error.response ?? {}
  throw new ApiError(
    status,
    data?.message ?? t('Something went wrong. Please try again.'),
    data?.errors,
  )
})
```

To try it in this project, submit a valid form with `taken@example.com` (field error) or `server error` in a text field (alert).

Reference: `src/api/ApiError.ts`, `src/api/forms.ts`.
