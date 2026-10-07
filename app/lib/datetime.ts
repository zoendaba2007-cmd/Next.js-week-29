// datetime-local inputs have no time zone. South Africa is UTC+02:00 all year (no daylight saving).
const TZ = 'Africa/Johannesburg';

/** "2026-10-08T09:30" (from the input) -> "2026-10-08T09:30:00+02:00" (for Postgres) */
export function fromDateTimeLocal(value: string): string {
  return value.length === 16 ? `${value}:00+02:00` : `${value}+02:00`;
}

/** timestamptz from Postgres -> "2026-10-08T09:30" (for a datetime-local defaultValue) */
export function toDateTimeLocal(iso: string): string {
  return new Date(iso)
    .toLocaleString('sv-SE', { timeZone: TZ })
    .replace(' ', 'T')
    .slice(0, 16);
}

/** For display: "8 Oct 2026, 09:30" */
export function formatAppointment(iso: string): string {
  return new Date(iso).toLocaleString('en-ZA', {
    timeZone: TZ,
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
