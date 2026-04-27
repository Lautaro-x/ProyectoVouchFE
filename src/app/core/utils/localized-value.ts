export function localizedValue(record: Record<string, string>, lang: string): string {
  return record[lang] || record['en'] || Object.values(record)[0] || '';
}
