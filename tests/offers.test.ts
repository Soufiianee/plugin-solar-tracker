import { describe, it, expect } from 'vitest';
import { letterKinds, letterFacts, showRooftopBox } from '../src/lib/offers';
import { states, byCode, isEnacted, referencePayback, rooftopFor, assumptions, affiliateLink, retailerLink, kits } from '../src/lib/data';
import type { State } from '../src/lib/schema';

const clone = (s: State): State => JSON.parse(JSON.stringify(s));

describe('notice letter: only states whose data confirms the protection', () => {
  it('offers letters exactly where the law protects tenants or owners (primary data)', () => {
    const offered = Object.fromEntries(states.filter((s) => letterKinds(s).length).map((s) => [s.code, letterKinds(s)]));
    expect(offered).toEqual({ CO: ['tenant', 'hoa'], NJ: ['tenant', 'hoa'], VA: ['tenant'], VT: ['tenant', 'hoa'] });
  });
  it('never offers a letter for a state without an enacted law', () => {
    for (const s of states.filter((x) => !isEnacted(x))) expect(letterKinds(s)).toEqual([]);
  });
  it('offers nothing for New Hampshire (details not confirmed on a primary source)', () => {
    expect(letterKinds(byCode.NH)).toEqual([]);
  });
  it('Virginia gets no HOA letter: its law keeps HOA rules in force', () => {
    expect(byCode.VA.rules.hoa_provisions.value).toBe('covenants_preserved');
    expect(letterFacts(byCode.VA, 'hoa')).toBeNull();
  });
  it('drops the letter when the protection facts are missing', () => {
    const s = clone(byCode.VT);
    delete s.rules.landlord_provisions.protection;
    expect(letterKinds(s)).toEqual(['hoa']);
  });
  it('drops the letter when the law effective date is unknown', () => {
    const s = clone(byCode.CO);
    s.bills.forEach((b) => (b.effective_date = 'unknown'));
    expect(letterKinds(s)).toEqual([]);
  });
  it('drops the letter when verification is not primary', () => {
    const s = clone(byCode.NJ);
    s.verification = 'partial';
    expect(letterKinds(s)).toEqual([]);
  });
  it('letter facts come from the data (Colorado protections start 2027-01-01, law text linked)', () => {
    const f = letterFacts(byCode.CO, 'tenant')!;
    expect(f.protection.applies_from).toBe('2027-01-01');
    expect(f.lawText.url).toBe(byCode.CO.rules.landlord_provisions.rule_sources[0].url);
    expect(letterFacts(byCode.VT, 'tenant')!.protection.notice_days).toBe(10);
  });
});

describe('rooftop comparison box threshold', () => {
  const min = assumptions.rooftop_box.min_payback_years;
  it('threshold is 8 years', () => expect(min).toBe(8));
  it('shows at exactly the threshold and above, not below', () => {
    expect(showRooftopBox(true, 8.0, 8)).toBe(true);
    expect(showRooftopBox(true, 7.9, 8)).toBe(false);
    expect(showRooftopBox(true, 12, 8)).toBe(true);
  });
  it('enacted state with no payback figure: no box', () => expect(showRooftopBox(true, null, 8)).toBe(false));
  it('state with no plug-in law: always shown', () => expect(showRooftopBox(false, null, 8)).toBe(true));
  it('with live data: Utah and Virginia show it; California and Colorado do not', () => {
    expect(referencePayback(byCode.UT)!).toBeGreaterThanOrEqual(min);
    expect(rooftopFor(byCode.UT)).toBe(true);
    expect(rooftopFor(byCode.VA)).toBe(true);
    expect(rooftopFor(byCode.CA)).toBe(false);
    expect(rooftopFor(byCode.CO)).toBe(false);
    expect(rooftopFor(byCode.TX)).toBe(true);
  });
});

describe('affiliate links', () => {
  it('empty slots fall back to the plain official URL, not sponsored', () => {
    const k = kits.find((x) => x.retailers.length)!;
    const l = retailerLink(k.retailers[0]);
    expect(l).toEqual({ href: k.retailers[0].url, rel: 'noopener', sponsored: false });
  });
  it('rooftop slot with no approved link renders no link at all', () => {
    expect(affiliateLink('rooftop_quotes')).toBeNull();
  });
});
