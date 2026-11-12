/**
 * Turns the New York state record into the "signed" record using data/drafts/new-york-signed.json.
 * Pure function: used by scripts/apply-ny-signed.ts, dry-run by scripts/validate.ts, and unit-tested.
 */
import type { State } from './schema';
import { addDays } from './effective';

export interface NyDraft {
  code: 'NY';
  effective_rule: { days_after_becoming_law: number; basis: string };
  rules: State['rules'];
  summary_plain_template: string;
  watch_notes_template: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const long = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };
const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? `{${k}}`);

export function applyNySigned(ny: State, draft: NyDraft, signed: string, chapter: string, today: string): State {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(signed)) throw new Error('signed must be YYYY-MM-DD');
  if (!chapter.trim()) throw new Error('chapter is required (e.g. "Chapter 512 of the Laws of 2026")');
  const effective = addDays(signed, draft.effective_rule.days_after_becoming_law);
  const v = { signed: long(signed), effective: long(effective), chapter };
  const [bill, ...rest] = ny.bills;
  const { status_label: _drop, ...base } = ny;
  return {
    ...base,
    status: effective <= today ? 'enacted_in_effect' : 'enacted_not_yet_effective',
    bills: [{
      ...bill,
      stage: 'signed_into_law',
      last_action: `Signed by the governor; ${chapter}`,
      last_action_date: signed,
      signed_date: signed,
      effective_date: effective,
      effective_date_basis: 'derived',
      effective_date_note: `Derived from ${draft.effective_rule.basis}`,
      chapter,
    }, ...rest],
    rules: draft.rules,
    summary_plain: fill(draft.summary_plain_template, v),
    watch_notes: fill(draft.watch_notes_template, v),
    next_key_date: effective,
    last_checked: today,
  };
}
