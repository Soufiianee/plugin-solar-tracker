import { describe, it, expect } from 'vitest';
import { verdict, assess } from '../src/lib/compat';
import { allNeighbourPairs } from '../src/lib/geo';

const c = (standard: string, status: string, scope: string) => ({ standard, status, scope, evidence_url: 'https://example.org/cert.pdf' });
const VT = { code: 'VT', enacted: true, cap: 1200, certReq: 'ul_3700_or_equivalent' as const };
const UT = { code: 'UT', enacted: true, cap: 1200, certReq: 'nrtl_certified_generic' as const };
const CT = { code: 'CT', enacted: true, cap: 1200, certReq: 'nrtl_and_ul_1741' as const };
const MD = { code: 'MD', enacted: true, cap: 1200, certReq: 'nrtl_certified_generic' as const };

describe('strict (UL 3700 / complete-system) states', () => {
  it('component-only UL 3700 certificate is never "compatible"', () => {
    expect(verdict(VT, { ac_output_w: 900, certifications: [c('UL 3700', 'certified', 'component')] })).toBe('component_only');
  });
  it('complete-system UL 3700 certificate is compatible', () => {
    expect(verdict(VT, { ac_output_w: 900, certifications: [c('UL 3700', 'certified', 'complete_system')] })).toBe('compatible');
  });
  it('UL 1741 certificate does not satisfy a UL 3700 law', () => {
    expect(verdict(VT, { ac_output_w: 400, certifications: [c('UL 1741', 'certified', 'component')] })).toBe('no_evidence');
  });
  it('claims and explicit non-certification', () => {
    expect(verdict(VT, { ac_output_w: 400, certifications: [c('UL 3700', 'pending_or_claimed', 'component')] })).toBe('ul3700_claimed');
    expect(verdict(VT, { ac_output_w: 400, certifications: [c('UL 3700', 'not_certified', 'complete_system')] })).toBe('not_certified');
  });
});

describe('lab-listed states', () => {
  it('a seen inverter certificate gives "likely compatible", with its evidence', () => {
    const a = assess(UT, { ac_output_w: 900, inverter_count: 1, certifications: [c('UL 1741', 'certified', 'component')] });
    expect(a.verdict).toBe('likely_compatible');
    expect(a.basis?.evidence_url).toBe('https://example.org/cert.pdf');
  });
  it('a maker claim gives "listing claimed"', () => {
    expect(verdict(UT, { ac_output_w: 1200, certifications: [c('UL 1741', 'pending_or_claimed', 'component')] })).toBe('listing_claimed');
  });
  it('Connecticut needs UL 1741: a UL 3700 claim alone is not enough', () => {
    expect(verdict(CT, { ac_output_w: 400, certifications: [c('UL 3700', 'pending_or_claimed', 'component')] })).toBe('no_evidence');
  });
  it('multi-inverter kits get a device-count caveat in CT and MD only', () => {
    const kit = { ac_output_w: 700, inverter_count: 2, certifications: [c('UL 1741', 'pending_or_claimed', 'component')] };
    expect(assess(CT, kit).caveats.join(' ')).toMatch(/Check device count/);
    expect(assess(MD, kit).caveats.join(' ')).toMatch(/Check device count/);
    expect(assess(UT, kit).caveats).toHaveLength(0);
  });
});

describe('size checks', () => {
  it('over the cap', () => {
    expect(verdict(VT, { ac_output_w: 1300, certifications: [c('UL 3700', 'certified', 'complete_system')] })).toBe('over_cap');
  });
  it('unstated output is fine when the panels alone are under the cap', () => {
    const a = assess(UT, { ac_output_w: 'unknown', panel_w_total: 360, certifications: [c('UL 1741', 'pending_or_claimed', 'component')] });
    expect(a.verdict).toBe('listing_claimed');
    expect(a.caveats[0]).toMatch(/panels total 360 W/);
    expect(verdict(UT, { ac_output_w: 'unknown', panel_w_total: 'not_included', certifications: [] })).toBe('output_unknown');
  });
  it('unverified rules and no law', () => {
    expect(verdict({ enacted: true, cap: 'unknown', certReq: 'unknown' }, { ac_output_w: 400, certifications: [] })).toBe('rules_unknown');
    expect(verdict({ enacted: false, cap: 'not_applicable', certReq: 'not_applicable' }, { ac_output_w: 400, certifications: [] })).toBe('no_state_law');
  });
});

describe('neighbour table', () => {
  it('is symmetric and has 51 entries', () => {
    const n = allNeighbourPairs();
    expect(Object.keys(n).length).toBe(51);
    for (const [a, list] of Object.entries(n)) for (const b of list.split(' ').filter(Boolean)) expect(n[b].split(' ')).toContain(a);
  });
});
