export const LANGS = ['es', 'en', 'fr', 'pt', 'it'] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LOCALES = [
  { code: 'en', label: 'English (EN) *' },
  { code: 'es', label: 'Español (ES)' },
  { code: 'fr', label: 'Français (FR)' },
  { code: 'pt', label: 'Português (PT)' },
  { code: 'it', label: 'Italiano (IT)' },
] as const;
