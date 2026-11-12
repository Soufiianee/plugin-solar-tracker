/**
 * Effective-date logic, evaluated at build time. Pure functions (tests/effective.test.ts).
 *
 * "Today" is the calendar date in Hawaii (UTC-10), the last US state to reach any given date, so the site
 * never calls a law "in effect" before that date has arrived everywhere in the country. Because this runs at
 * build time, the site must be rebuilt on (or after) each effective date; see MAINTENANCE_PROMPT.md.
 */
export const SITE_TIME_ZONE = 'Pacific/Honolulu';

/** ISO date (YYYY-MM-DD) for `now` in SITE_TIME_ZONE. */
export function todayIso(now: Date = new Date()): string {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: SITE_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const g = (t: string) => p.find((x) => x.type === t)!.value;
  return `${g('year')}-${g('month')}-${g('day')}`;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** A law marked "passed, not yet in effect" is shown as "in effect" once its known effective date has arrived. */
export function displayStatus<T extends string>(status: T, effectiveDate: string | null, today: string): T | 'enacted_in_effect' {
  if (status === 'enacted_not_yet_effective' && effectiveDate && ISO.test(effectiveDate) && effectiveDate <= today) return 'enacted_in_effect';
  return status;
}

/** "Starts January 1, 2027" before the date; "In effect since January 1, 2027" on and after it. */
export function effectivePhrase(effectiveDate: string, today: string, fmt: (iso: string) => string): string {
  return effectiveDate <= today ? `In effect since ${fmt(effectiveDate)}` : `Starts ${fmt(effectiveDate)}`;
}

/** Date `days` after an ISO date (used for "takes effect on the ninetieth day after it becomes law"). */
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
