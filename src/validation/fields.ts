import { z } from 'zod'

import { t } from './messages'

// Shared field schemas. Default messages come from the global error map (errorMap.ts).

export function requiredText({ max }: { max?: number } = {}) {
  const schema = z.string().trim().min(1)
  return max === undefined ? schema : schema.max(max)
}

export function optionalText({ max }: { max?: number } = {}) {
  const schema = z.string().trim()
  return max === undefined ? schema : schema.max(max)
}

export function email() {
  return z.string().trim().min(1).pipe(z.email())
}

export function phone() {
  return requiredText().regex(/^\+?[0-9][0-9\s-]{6,19}$/, {
    error: () => t('Enter a valid phone number'),
  })
}

// Empty input is allowed and becomes null; anything else must be an http(s) URL.
export function optionalUrl() {
  return z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : value))
    .pipe(z.url({ protocol: /^https?$/, hostname: z.regexes.domain }).nullable())
}

export function integer({ min, max }: { min?: number; max?: number } = {}) {
  let schema = z.int()
  if (min !== undefined) schema = schema.min(min)
  if (max !== undefined) schema = schema.max(max)
  return schema
}

export function money({ min = 0 }: { min?: number } = {}) {
  return z.number().min(min).multipleOf(0.01, { error: () => t('Use at most 2 decimal places') })
}

export function requiredDateTime() {
  return z.date()
}

export function futureDateTime() {
  return z.date().refine((value) => value.getTime() > Date.now(), {
    error: () => t('Must be in the future'),
  })
}

export function pastDate() {
  return z.date().refine((value) => value.getTime() < Date.now(), {
    error: () => t('Must be in the past'),
  })
}
