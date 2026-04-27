export const LANGS = ['es', 'en', 'fr', 'pt', 'it'] as const;
export type Lang = (typeof LANGS)[number];

export const ACTIVE_LANGS = ['es', 'en'] as const;
export type ActiveLang = (typeof ACTIVE_LANGS)[number];

export const LANG_LOCALES = [
  { code: 'en', label: 'English (EN) *' },
  { code: 'es', label: 'Español (ES)' },
  { code: 'fr', label: 'Français (FR)' },
  { code: 'pt', label: 'Português (PT)' },
  { code: 'it', label: 'Italiano (IT)' },
] as const;
