export type MessageParams = Record<string, string | number>

// Stand-in for vue-i18n's `t`: the English text is the translation key, `{name}` are placeholders.
export function t(key: string, params: MessageParams = {}): string {
  return key.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}
