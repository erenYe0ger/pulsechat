export function parseUTCDate(dateString: string): Date {
  const hasTimezone = /Z|[+-]\d{2}:\d{2}$/.test(dateString);
  return new Date(hasTimezone ? dateString : dateString + "Z");
}
