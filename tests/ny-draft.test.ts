import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { applyNySigned, type NyDraft } from '../src/lib/ny-draft';
import { statesFile } from '../src/lib/schema';
import { needsSystemCert } from '../src/lib/compat';

const states = JSON.parse(readFileSync('data/states.json', 'utf8'));
const draft = JSON.parse(readFileSync('data/drafts/new-york-signed.json', 'utf8')) as NyDraft;
const ny = states.find((s: { code: string }) => s.code === 'NY');

describe('New York: switch to signed', () => {
  it('today the page shows the accurate status', () => {
    expect(ny.status).toBe('bill_active');
    expect(ny.status_label).toBe('Passed legislature, awaiting signature');
    expect(ny.bills[0].stage).toBe('passed_legislature_not_sent_to_governor');
  });
  it('signing produces a valid record, effective on the 90th day', () => {
    const out = applyNySigned(ny, draft, '2026-12-05', 'Chapter 512 of the Laws of 2026', '2026-12-06');
    expect(out.status).toBe('enacted_not_yet_effective');
    expect(out.bills[0].effective_date).toBe('2027-03-05');
    expect(out.bills[0].effective_date_basis).toBe('derived');
    expect(out.status_label).toBeUndefined();
    expect(out.rules.max_watts_ac.value).toBe(1200);
    expect(needsSystemCert(out.rules.certification_required.value)).toBe(true);
    expect(() => statesFile.parse(states.map((s: { code: string }) => (s.code === 'NY' ? out : s)))).not.toThrow();
  });
  it('refuses a missing chapter or a bad date', () => {
    expect(() => applyNySigned(ny, draft, '12/05/2026', 'Chapter 1', '2026-12-06')).toThrow();
    expect(() => applyNySigned(ny, draft, '2026-12-05', ' ', '2026-12-06')).toThrow();
  });
});
