import { describe, it, expect } from 'vitest';
import { todayIso, displayStatus, effectivePhrase, addDays } from '../src/lib/effective';

const fmt = (iso: string) => ({ '2027-01-01': 'January 1, 2027' })[iso] ?? iso;

describe('effective-date switch (build time)', () => {
  it('before the date: "Starts", status unchanged', () => {
    expect(effectivePhrase('2027-01-01', '2026-12-31', fmt)).toBe('Starts January 1, 2027');
    expect(displayStatus('enacted_not_yet_effective', '2027-01-01', '2026-12-31')).toBe('enacted_not_yet_effective');
  });
  it('on and after the date: "In effect since", status shown as in effect', () => {
    expect(effectivePhrase('2027-01-01', '2027-01-01', fmt)).toBe('In effect since January 1, 2027');
    expect(displayStatus('enacted_not_yet_effective', '2027-01-01', '2027-01-01')).toBe('enacted_in_effect');
    expect(displayStatus('enacted_not_yet_effective', '2027-01-01', '2027-03-15')).toBe('enacted_in_effect');
  });
  it('never flips without a known date, and leaves other statuses alone', () => {
    expect(displayStatus('enacted_not_yet_effective', 'unknown', '2030-01-01')).toBe('enacted_not_yet_effective');
    expect(displayStatus('enacted_not_yet_effective', null, '2030-01-01')).toBe('enacted_not_yet_effective');
    expect(displayStatus('bill_active', '2027-01-01', '2030-01-01')).toBe('bill_active');
  });
  it('"today" is Hawaii time, so a law is never shown in effect early anywhere in the US', () => {
    // 2027-01-01 08:00 UTC = midnight in California, but still Dec 31 in Hawaii
    expect(todayIso(new Date('2027-01-01T08:00:00Z'))).toBe('2026-12-31');
    // 10:00 UTC = midnight in Hawaii
    expect(todayIso(new Date('2027-01-01T10:00:00Z'))).toBe('2027-01-01');
  });
  it('ninetieth day after signing (New York draft)', () => {
    expect(addDays('2026-12-01', 90)).toBe('2027-03-01');
  });
});
