export function localizedValue(record: Record<string, string>, lang: string): string {
  return record[lang] || record['es'] || Object.values(record)[0] || '';
}
