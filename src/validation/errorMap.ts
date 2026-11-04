import { z } from 'zod'

import { t } from './messages'

function isEmpty(value: unknown) {
  return value === null || value === undefined || value === ''
}

function formatLimit(origin: string, limit: number | bigint) {
  return origin === 'date' ? new Date(Number(limit)).toLocaleString() : Number(limit)
}

// Turns Zod's built-in issues into our messages, so schemas only need a custom message for special cases.
export function installZodErrorMap() {
  z.config({
    customError(issue) {
      switch (issue.code) {
        case 'invalid_type':
          if (isEmpty(issue.input)) return t('This field is required')
          if (issue.expected === 'int' && typeof issue.input === 'number') {
            return t('Must be a whole number')
          }
          if (issue.expected === 'number' || issue.expected === 'int') return t('Enter a valid number')
          if (issue.expected === 'date') return t('Enter a valid date')
          return t('Invalid value')

        case 'too_small': {
          if (issue.origin === 'string') {
            return Number(issue.minimum) <= 1
              ? t('This field is required')
              : t('Must be at least {min} characters', { min: Number(issue.minimum) })
          }
          const min = formatLimit(issue.origin, issue.minimum)
          if (issue.origin === 'date') return t('Must be on or after {min}', { min })
          return issue.inclusive
            ? t('Must be at least {min}', { min })
            : t('Must be greater than {min}', { min })
        }

        case 'too_big': {
          if (issue.origin === 'string') {
            return t('Must be at most {max} characters', { max: Number(issue.maximum) })
          }
          const max = formatLimit(issue.origin, issue.maximum)
          if (issue.origin === 'date') return t('Must be on or before {max}', { max })
          return issue.inclusive
            ? t('Must be at most {max}', { max })
            : t('Must be less than {max}', { max })
        }

        case 'invalid_value':
          return isEmpty(issue.input) ? t('This field is required') : t('Select a valid option')

        case 'invalid_format':
          if (issue.format === 'email') return t('Enter a valid email address')
          if (issue.format === 'url') return t('Enter a valid URL')
          return t('Invalid format')

        case 'not_multiple_of':
          return t('Must be a multiple of {divisor}', { divisor: issue.divisor })
      }
      return undefined
    },
  })
}
