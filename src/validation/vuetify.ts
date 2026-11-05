// defineField config for Vuetify inputs: puts the field's errors into its attrs as `error-messages`,
// so `v-bind="attrs"` wires up both the blur validation and the error display.
export const vuetifyConfig = {
  props: (state: { errors: string[] }) => ({ "error-messages": state.errors }),
};
