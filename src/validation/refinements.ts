import { z } from 'zod'

import { t, type MessageParams } from './messages'

// Shared cross-field checks, used as `objectSchema.check(endAfter('startsAt', 'endsAt'))`.
// Each one reports its error on a single field (`path`), and only runs once the fields it
// reads are valid themselves. Zod would otherwise skip it whenever *any* field is invalid.

type ParsePayload = Parameters<NonNullable<z.core.$ZodCheckDef['when']>>[0]

function whenValid(keys: PropertyKey[]) {
  return (payload: ParsePayload) =>
    !payload.issues.some((issue) => {
      const key = issue.path?.[0]
      return key !== undefined && keys.includes(key)
    })
}

function message(key: string, params?: MessageParams) {
  return () => t(key, params)
}

export function endAfter<T extends object>(
  startKey: keyof T & string,
  endKey: keyof T & string,
  errorMessage = 'End time must be after start time',
) {
  return z.refine<T>(
    (value) => (value[endKey] as Date).getTime() > (value[startKey] as Date).getTime(),
    { path: [endKey], when: whenValid([startKey, endKey]), error: message(errorMessage) },
  )
}

export function maxDuration<T extends object>(
  startKey: keyof T & string,
  endKey: keyof T & string,
  days: number,
  errorMessage = 'Must be at most {days} days after the start',
) {
  const maxMs = days * 24 * 60 * 60 * 1000
  return z.refine<T>(
    (value) => (value[endKey] as Date).getTime() - (value[startKey] as Date).getTime() <= maxMs,
    { path: [endKey], when: whenValid([startKey, endKey]), error: message(errorMessage, { days }) },
  )
}

// `limit` returns null when there is nothing to compare against yet (e.g. no room selected).
export function sumAtMost<T extends object>(
  keys: (keyof T & string)[],
  limit: (value: T) => number | null,
  targetKey: keyof T & string,
  errorMessage = 'The total cannot be more than {max}',
) {
  return z.superRefine<T>(
    (value, ctx) => {
      const max = limit(value)
      if (max === null) return
      const total = keys.reduce((sum, key) => sum + Number(value[key] ?? 0), 0)
      if (total > max) {
        ctx.addIssue({ code: 'custom', path: [targetKey], message: t(errorMessage, { max }) })
      }
    },
    { when: whenValid([...keys, targetKey]) },
  )
}
