/** New Hampshire record (SB 540-FN, Chapter 262 of 2026): the facts, the January 1 switch, and the kit audit. */
import { describe, it, expect } from 'vitest';
import statesRaw from '../data/states.json';
import { byCode, kits, kitAssess } from '../src/lib/data';
import { displayStatus, effectivePhrase } from '../src/lib/effective';
import { assess, needsSystemCert } from '../src/lib/compat';
import { lawFindings } from '../src/lib/findings';
import { keyFindings, quoteFacts, storyAngles } from '../src/lib/press';
import { statesCsv } from '../src/lib/datasets';

const raw = (statesRaw as any[]).find((s) => s.code === 'NH');
const nh = byCode.NH;

describe('New Hampshire record', () => {
  it('is a confirmed, signed law with a stated January 1, 2027 effective date', () => {
    expect(raw.status).toBe('enacted_not_yet_effective');
    expect(raw.verification).toBe('primary');
    expect(raw.status_label).toBeUndefined();
    const b = raw.bills[0];
    expect([b.id, b.stage, b.signed_date, b.effective_date, b.effective_date_basis]).toEqual(['SB 540-FN', 'signed_into_law', '2026-07-02', '2027-01-01', 'stated_in_law']);
    expect(b.chapter).toBe('Chapter 262, Laws of 2026');
    expect(b.effective_date_note).toMatch(/Remainder Effective 07\/02\/2026/); // docket discrepancy recorded
  });
  it('rules as read from RSA 362-A:10', () => {
    const r = raw.rules;
    expect(r.max_watts_ac.value).toBe(1200);
    expect(r.utility_approval_required.value).toBe('no');
    expect(r.utility_notification_required.value).toBe('optional');
    expect(r.certification_required.value).toBe('nrtl_certified_generic');
    expect(r.landlord_provisions.value).toBe('not_addressed');
    expect(r.hoa_provisions.value).toBe('not_addressed');
    expect(r.landlord_provisions.protection).toBeUndefined();
  });
  it('every set rule cites the official RSA page; no unofficial copy is relied on', () => {
    for (const [k, rule] of Object.entries<any>(raw.rules)) {
      if (rule.value === 'unknown') continue;
      expect(rule.rule_sources.length, k).toBeGreaterThan(0);
      for (const s of rule.rule_sources) expect(s.url, k).toMatch(/^https:\/\/gc\.nh\.gov\/rsa\/html\//);
    }
    expect(raw.sources.some((s: any) => s.type === 'secondary_mirror')).toBe(false);
    expect(raw.last_checked).toBe('2026-11-17');
  });
});

describe('January 1, 2027 switch (same logic as California)', () => {
  it('shows "not yet in effect" until December 31 and "in effect" from January 1', () => {
    expect(displayStatus(raw.status, '2027-01-01', '2026-12-31')).toBe('enacted_not_yet_effective');
    expect(displayStatus(raw.status, '2027-01-01', '2027-01-01')).toBe('enacted_in_effect');
    const fmt = (s: string) => s;
    expect(effectivePhrase('2027-01-01', '2026-12-31', fmt)).toBe('Starts 2027-01-01');
    expect(effectivePhrase('2027-01-01', '2027-01-01', fmt)).toBe('In effect since 2027-01-01');
  });
});

describe('kit audit for New Hampshire', () => {
  it('uses the lab-listed rule, exactly as a Colorado-style law with the same size limit', () => {
    expect(needsSystemCert(nh.rules.certification_required.value)).toBe(false);
    for (const k of kits) {
      const asNh = kitAssess(nh, k).verdict;
      const asLabListed = assess({ enacted: true, cap: 1200, certReq: byCode.CO.rules.certification_required.value }, k).verdict;
      expect(asNh, k.slug).toBe(asLabListed);
      expect(asNh).not.toBe('rules_unknown');
    }
  });
  it('flags multi-inverter kits: one system per metered customer', () => {
    for (const k of kits.filter((x) => x.inverter_count !== 1)) {
      const a = kitAssess(nh, k);
      if (['over_cap', 'output_unknown'].includes(a.verdict)) continue;
      expect(a.caveats.join(' '), k.slug).toMatch(/one plug-in system per metered customer/);
    }
  });
});

describe('"being verified" is gone everywhere', () => {
  it('findings, press text and CSV', () => {
    expect(lawFindings().beingVerified).toEqual([]);
    const all = [...keyFindings().map((f) => f.text), ...quoteFacts(), ...storyAngles().map((a) => a.text), statesCsv()].join(' ');
    expect(all).not.toMatch(/being verified|still verifying/i);
  });
});
