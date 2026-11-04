import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  defaults: {
    // Check a field when the user leaves it; once it's invalid, re-check while they type.
    // `lazy`: nothing is checked on load, so unchecked fields keep `isValid === null`.
    VForm: { validateOn: 'blur invalid-input lazy' },
  },
})
