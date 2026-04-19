export function utcToLocal(dt: string): string {
  if (!dt) return dt;
  const d = new Date(dt.replace(' ', 'T') + 'Z');
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function localToUTC(dt: string): string {
  if (!dt) return dt;
  return new Date(dt).toISOString().slice(0, 16);
}
