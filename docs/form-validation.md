# Form validation

Forms use [vee-validate](https://vee-validate.logaretm.com/v4/) with [Zod](https://zod.dev/) schemas and Vuetify inputs.

## 1. Define the schema

Create `src/validation/<form>Schema.ts`. Build it from the shared rules in `src/validation/rules.ts`, and tie it to the form's input type with `satisfies`.

```ts
import { z } from "zod";

import type { ThingInput } from "@/types/forms";
import { required, requiredEmail, requiredString } from "./rules";

export const thingSchema = z.object({
  name: requiredString("Name is required"),
  email: requiredEmail(),
  count: required(z.number().int(), "Count is required"),
}) satisfies z.ZodType<ThingInput>;
```

- Nullable fields (`number | null`, `Date | null`): wrap them with `required(schema, message)`.
- Cross-field checks: use `.refine(...)` on the object. For date ranges, use `.refine(...dateRange("start", "end"))`.
- If a rule could be reused in other forms, add it to `rules.ts`.

## 2. Use it in the component

```ts
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { vuetifyConfig } from "@/validation/vuetify";

// Pass the type explicitly. vee-validate can't infer it when initialValues is also passed.
const { defineField, handleSubmit, isSubmitting } = useForm<ThingInput>({
  validationSchema: toTypedSchema(thingSchema),
  initialValues: { name: "", email: "", count: null },
});

const [name, nameAttrs] = defineField("name", vuetifyConfig);

// Only runs when the form is valid. `values` is typed as ThingInput.
const onSubmit = handleSubmit(async (values) => {
  await createThing(values);
});
```

## 3. Bind the fields

```html
<v-form @submit.prevent="onSubmit">
  <v-text-field v-model="name" v-bind="nameAttrs" label="Name" />
  <v-btn type="submit" :loading="isSubmitting">Save</v-btn>
</v-form>
```

`v-bind="nameAttrs"` validates the field on blur and shows its error. You don't need `:error-messages`.

## Custom input components

To work with `v-bind="attrs"`, a custom input (see `DateTimeField.vue`) must:

- accept an `errorMessages` prop (`string | string[]`) and pass it to an inner Vuetify input.
- emit `blur` when focus leaves the whole component.
