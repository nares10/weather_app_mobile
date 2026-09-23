// Open-Meteo local times have no timezone offset ("2026-09-23T14:00").
// Passing them to `new Date()` would reinterpret them in the *device's*
// timezone, so we read the parts directly instead.

export function formatTemperature(celsius: number): string {
  return `${Math.round(celsius)}°`;
}

// "2026-09-23T14:00" -> "14:00"
export function formatHour(localTime: string): string {
  return localTime.slice(11, 16);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// "2026-09-23" -> "Wed". Treat the date as UTC so the weekday can't shift.
export function formatWeekday(localDate: string): string {
  return WEEKDAYS[new Date(`${localDate}T00:00:00Z`).getUTCDay()];
}
